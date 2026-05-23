import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import type { Task } from "../types.js";
import { formatTaskDate } from "../utils/date.js";
import { priorityAccessory, priorityLabel } from "../utils/task.js";

export function TaskListItem({
  task,
  onComplete,
}: {
  task: Task;
  onComplete?: (task: Task) => Promise<void>;
}) {
  const priority = priorityAccessory(task.priority);

  return (
    <List.Item
      icon={Icon.Circle}
      title={task.title}
      subtitle={task.content || task.desc}
      accessories={[
        ...(priority ? [priority] : []),
        task.dueDate
          ? {
              text: formatTaskDate(task.dueDate),
              icon: { source: Icon.Calendar, tintColor: Color.Blue },
            }
          : { text: "No date" },
      ]}
      detail={<List.Item.Detail markdown={task.content || task.desc || ""} />}
      actions={
        <ActionPanel>
          {onComplete ? (
            <Action
              title="Complete Task"
              icon={Icon.CheckCircle}
              onAction={() => onComplete(task)}
            />
          ) : null}
          <Action.CopyToClipboard
            title="Copy Task Title"
            content={task.title}
          />
          <Action.CopyToClipboard
            title="Copy Task ID"
            content={`taskId=${task.id}\nprojectId=${task.projectId}\npriority=${priorityLabel(task.priority)}`}
          />
        </ActionPanel>
      }
    />
  );
}
