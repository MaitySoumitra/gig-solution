const Board=require('../models/Board')
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

        if (board.members.includes(memberId)) {
            return res.status(400).json({ message: "User already a member" });
        }

        board.members.push(memberId);
        await board.save();

        await User.findByIdAndUpdate(memberId, {
            $addToSet: { memberOfBoards: board._id }
        });

        await board.populate('members', 'name email role');

        // ✅ MISSING return statement in some previous versions
        return res.status(200).json(board);
    } catch (error) {
        console.error("error adding member", error);
        res.status(500).json({ message: "Server error: could not add member" });
    }
};



module.exports={createBoard, getBoardsForUser, getBoardById, addMemberToBoard}