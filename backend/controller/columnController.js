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
        const isMember=board.members.some(member=>member.toString()=== req.user._id.toString())
        if(!isMember){
            return res.status(403).json({message: "Access Denied: You must be Member to Modify this board."})
        }
        const newColumn=new Column({
            name,
            board:boardId,
            task:[],
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
const fetchColumn= async(req, res)=>{
    const {boardId}=req.params;
    try{
        const columns= await Column.find({board:boardId}).populate('task')
        res.status(200).json(columns)
    }
    catch(error){
        console.error('something went wrong', error)
        res.status(500).json({message: "server error cant fetch columns "})
    }
}

module.exports= {createColumn, fetchColumn}