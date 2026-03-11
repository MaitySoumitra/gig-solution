interface DeleteBoardModalProps {
  board: any;
  onCancel: () => void;
  onConfirm: (boardId: string) => void;
}

export const DeleteBoardModal = ({ board, onCancel, onConfirm }: DeleteBoardModalProps) => {
  if (!board) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-xl p-6 w-96 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          Confirm Delete
        </h2>

        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete
          <span className="font-semibold text-red-600">
            {" "}{board.name}
          </span>
          ?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(board._id)}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};