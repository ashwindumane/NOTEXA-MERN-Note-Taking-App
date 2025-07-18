import { useState } from "react"
const TagInput = ({ tags, setTags }) => {
  const [input, setInput] = useState("")
  const addTag = () => {
    if (input && !tags.includes(input)) {
      setTags([...tags, input])
      setInput("")
    }
  }
  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index))
  }
  return (
    <div className="flex flex-wrap gap-2 items-center border rounded p-2">
      {tags.map((tag, index) => (
        <span key={index} className="bg-blue-200 text-blue-800 px-2 py-1 rounded flex items-center">
          {tag}
          <button onClick={() => removeTag(index)} className="ml-2 text-sm">×</button>
        </span>
      ))}
      <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag()} placeholder="Add tag" className="outline-none p-1 flex-1 min-w-[120px] bg-transparent" />
    </div>
  )
}
export default TagInput
