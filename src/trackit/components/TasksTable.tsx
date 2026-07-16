// trackit frontend
import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import type { Task } from "@/trackit/api/tasksApi"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { previewFromTiptapContent } from "@/trackit/utils/previewFromTiptap"
import { DeleteTaskDialog } from "@/trackit/components/DeleteTaskDialog"

type TasksTableProps = {
  tasks: Task[]
  onView: (task: Task) => void
  onEdit: (task: Task) => void
  onDeleted: (id: number | string) => void
}

function formatTaskId(id: number | string) {
  if (typeof id === "string") return id
  return `${id}`
}

export function TasksTable({ tasks, onView, onEdit, onDeleted }: TasksTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-[#e5eaf2] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="border-[#e5eaf2] bg-[#f8fafc] hover:bg-[#f8fafc]">
              <TableHead className="w-[72px] !text-[#64748b]">ID</TableHead>
              <TableHead className="w-[180px] !text-[#64748b]">Title</TableHead>
              <TableHead className="w-[280px] !text-[#64748b]">
                Content Preview
              </TableHead>
              <TableHead className="w-[200px] text-right !text-[#64748b]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center !text-[#64748b]"
                >
                  No tasks yet.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow
                  key={String(task.id)}
                  onClick={() => onView(task)}
                  className="cursor-pointer border-[#e5eaf2] transition-colors hover:bg-[#eef4ff]/70"
                >
                  <TableCell className="w-[72px] font-mono text-sm !text-[#64748b]">
                    {formatTaskId(task.id)}
                  </TableCell>
                  <TableCell className="w-[180px] truncate font-semibold !text-[#1e293b]">
                    {task.title || "—"}
                  </TableCell>
                  <TableCell className="w-[280px] !text-[#64748b]">
                    <span className="block line-clamp-2 whitespace-normal break-words font-normal">
                      {previewFromTiptapContent(task.content)}
                    </span>
                  </TableCell>
                  <TableCell className="w-[200px] text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 border-slate-200 bg-white text-slate-800 hover:bg-gray-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(task)
                        }}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 border-red-200 bg-white text-red-500 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget(task)
                        }}
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteTaskDialog
        task={deleteTarget}
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onDeleted={(id) => {
          onDeleted(id)
          setDeleteTarget(null)
        }}
      />
    </>
  )
}
