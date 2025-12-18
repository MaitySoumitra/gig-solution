import { useState } from "react"

export const DragDrop = () => {
    const [leftItems, setLeftItems] = useState([
        "Apple", "Banna", "Mango"
    ])
    const [rightItems, setRightItems] = useState<string[]>([])

    const handaleDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        item: string,
        from: "left" | "right"
    ) => {
        e.dataTransfer.setData("application/json", JSON.stringify({ item, from }))
    }

    const handaleDrop = (
        e: React.DragEvent<HTMLDivElement>,
        to: "left" | "right"
    ) => {
        e.preventDefault()
        const data = JSON.parse(e.dataTransfer.getData("application/json")) as { item: string; from: "left" | "right" }

        if (data.from === to) return;

        if (to === "left") {
            setRightItems((prev) => prev.filter((i) => i !== data.item))
            setLeftItems((prev) => [...prev, data.item])
        }
        else {
            setLeftItems((prev) => prev.filter((i) => i !== data.item))
            setRightItems((prev) => [...prev, data.item])
        }
    }
    return (
        <div className="flex p-4 gap-8">
            <div
                className="w-48 min-h-[200px] border border-dashed border-gray-400 p-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handaleDrop(e, "left")}
            >
                {leftItems.map((item) => {
                    return (
                        <div key={item} 
                        draggable
                        onDragStart={(e)=>handaleDragStart(e, item, "left")}
                        className="mb-2 rounded-sm bg-blue-300 text-white cursor-pointer p-4">
                            {item}
                        </div>
                    )
                })}

                {leftItems.length === 0 && "Drop here"}
            </div>
            <div onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handaleDrop(e, "right")}
                className="w-48 min-h-[200px] border border-dashed border-gray-400 p-3"
            >
                {rightItems.map((item) => (
                    <div key={item}
                    draggable
                    onDragStart={(e)=> handaleDragStart(e, item, "right")}
                    className="mb-2 rounded-sm bg-blue-300 text-white cursor-pointer p-4"
                    >
                        {item}
                    </div>
                ))}
                {rightItems.length === 0 && "Drop here"}
            </div>
        </div>
    )
}
