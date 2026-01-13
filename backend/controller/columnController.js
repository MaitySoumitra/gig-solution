const Board=require('../models/Board')
const Column=require('../models/Column')

const  createColumn= async(req, res)=>{
    const boardId=req.params.boardId;
    const {name}=req.body;
    try{
        const board=await Board.findById(boardId).select('members');
        if(!board){
            return res.status(404).json({message: "Board Not found"});
        }
       const isMember = board.members.some(member => member._id.toString() === req.user._id.toString())
        if(!isMember){
            return res.status(403).json({message: "Access Denied: You must be Member to Modify this board."})
        }
        const newColumn=new Column({
            name,
            board:boardId,
            
        })
        await newColumn.save()

        await Board.findByIdAndUpdate(
            boardId,
            { $push: {columns: newColumn._id}},
        )
        res.status(201).json(newColumn)
    }
    catch(error){
        console.error(`Error creating Column for Board ${boardId}`, error);
        if(error.name==='CastError'){
            return res.status(400).json({message: 'Invalid Board ID format'})
        }
        return res.status(500).json({message: 'Server error: failedto create column '})
    }
}
const fetchTasksByBoard = async (req, res) => {
    const { boardId } = req.params;
    try {
        // Find all tasks that belong to this board
        const tasks = await Task.find({ board: boardId });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks" });
    }
}
const deleteColumn= async(req, res)=>{
    const {columnId}=req.params
    try{
        const column=await Column.findById(columnId);
        if(!column){
            return res.status(404).json({message: "Column Not found"})
        }
        const board= await Board.findById(column.board).select('members')
        const isMember=board.members.some(member=> member._id.toString()===req.user._id.toString())
        if(!isMember){
            return res.status(403).json({message: "Access Denied Deleting Column"})
        }
        await Board.findByIdAndUpdate(column.board, {
            $pull: {columns: columnId}
        })
        await Column.findByIdAndDelete(columnId)

        return res.status(200).json({message: "Deleted Column Successfully"})
    }
    catch(error){
        console.error(`error deleting column ${columnId}`, error)
        res.status(500).json({message: "Internal server error"})
    }
}
// Controller: getColumns
const getColumns = async (req, res) => {
  try {
    const columns = await Column.find({ board: req.params.boardId });
    // Do NOT .populate('tasks') if the field isn't in your Schema!
    res.status(200).json(columns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching columns" });
  }
};

module.exports= {createColumn, fetchTasksByBoard, deleteColumn, getColumns}