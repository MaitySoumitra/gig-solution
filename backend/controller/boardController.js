const Board=require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const User =require('../models/User')

const createBoard = async (req, res) => {
    const { name, members } = req.body;
    const ownerId = req.user._id;

    try {
        const newBoard = new Board({
            name,
            owner: ownerId,
            members: [ownerId, ...(members || [])]
        });
newBoard._userContext = ownerId;
        await newBoard.save();

        await User.updateMany(
            { _id: { $in: newBoard.members } },
            { $addToSet: { memberOfBoards: newBoard._id } }
        );

        // 🔥 IMPORTANT: populate before sending response
        const populatedBoard = await Board.findById(newBoard._id)
            .populate('owner', 'name email')
            .populate('members', 'name email role');

        return res.status(201).json(populatedBoard);

    } catch (error) {
        console.error('Error creating Board', error);
        res.status(500).json({ message: 'server error: failed to create board' });
    }
};


const getBoardsForUser= async (req, res)=>{
    try{
        const boards=await Board.find({
            members: req.user._id
        })
        .select('_id name owner members')
        .populate('owner', 'name email')
        .populate('members', 'name email role')
        res.status(200).json(boards);

    }
    catch(error){
        console.error('Error fetching boards ', error);
        res.status(500).json({message: "server error: could not fetch boards"})
    }
}
const getBoardById = async (req, res) => {
    const boardId = req.params.id;
    try {
        const board = await Board.findById(boardId)
            .populate({
                path: 'columns',
                populate: {
                    path: 'task',
                    model: 'Task',
                    populate: {
                        path: 'assignedTo',
                        model: 'User',
                        select: 'name email role profilepicture'
                    }
                }
            })
            .populate('owner', 'name email')
            .populate('members', 'name email role');

        if (!board) return res.status(404).json({ message: 'Board not found' });
        const isMember = Array.isArray(board.members) && board.members.some(member => member?._id?.toString() === req.user?._id?.toString());

        if (!isMember) return res.status(403).json({ message: 'Access Denied. You are not a member of Board' });

        res.status(200).json(board);
    } catch (error) {
        console.error(`Error fetching board ${boardId}:`, error);
        if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid BoardId format' });
        res.status(500).json({ message: "Server error: Failed to retrieve board details" });
    }
}


const addMemberToBoard = async (req, res) => {
    const { boardId } = req.params;
    const { memberId } = req.body;

    try {
        const board = await Board.findById(boardId);
        if (!board) return res.status(404).json({ message: "Board not found" });

        // 1. Set the context (Same as you do for Tasks)
        board._userContext = req.user._id; 

        if (board.members.includes(memberId)) {
            return res.status(400).json({ message: "User already a member" });
        }

        // 2. Add member and Save
        board.members.push(memberId);
        
        // This save() call now triggers the post('save') hook we wrote above!
        await board.save(); 

        // 3. Update User document
        await User.findByIdAndUpdate(memberId, {
            $addToSet: { memberOfBoards: board._id }
        });

        await board.populate('members', 'name email role');
        return res.status(200).json(board);
    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteBoard=async(req, res)=>{
    const {boardId}=req.params;
    try{
        const board=await Board.findById(boardId)
        if(!board){
            return res.status(404).json({meesage: "board not found"})
        }

        await Task.deleteMany({board: boardId})
        await Column.deleteMany({board: boardId})
        await User.updateMany(
            {memberOfBoards:boardId},
            {$pull:{memberOfBoards:boardId}}
        )
        await board.deleteOne()
        return res.status(200).json({message:"Board deleted successfully"})
    }
    catch(error){
        return res.status(500).json({message:"server eroor during deleting process"})
    }
}

const editBoard=async(req, res)=>{
    const {boardId}=req.params;
    const {name}=req.body;
    if(!name || name.trim()===""){
        return res.status(403).json({message: "board name is not found"})
    }
    try{
        const board=await Board.findById(boardId)
        if(!board){
            return res.status(404).json({message: "board is not found"})
        }
        if(board.owner.toString()!== req.user._id.toString()){
            return res.status(400).json({message: "only owner can edit the board"})
        }
        board.name=name
        await board.save()

        const populatedBoard=await Board.findById(board._id)
        .populate('owner', 'name email')
        .populate('members', 'name email role')
        .populate('columns', 'name')
        return res.status(200).json(populatedBoard)

    }
    catch(error){
        return res.status(500).json({message: "Internal server error"})
    }
}

module.exports={createBoard, getBoardsForUser, getBoardById, addMemberToBoard, deleteBoard, editBoard}