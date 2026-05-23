import {
  Action,
  ActionPanel,
  Color,
  Icon,
  List,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import {
  completeTask,
  describeApiError,
  listOpenTasks,
} from "./api/dida365.js";
import { SetupTokenView } from "./components/setup-token-view.js";
import { isMissingApiToken } from "./setup.js";
import type { Task } from "./types.js";
import { formatTaskDate } from "./utils/date.js";
import {
  priorityAccessory,
  priorityLabel,
  taskSearchText,
} from "./utils/task.js";

export default function Command() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [searchText, setSearchText] = useState("");

  async function loadTasks() {
    setIsLoading(true);
    try {
      setTasks(await listOpenTasks());
    } catch (error) {
      if (isMissingApiToken(error)) {
        setNeedsSetup(true);
        return;
      }

      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to load tasks",
        message: describeApiError(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (needsSetup) {
    return <SetupTokenView />;
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const openTasks = tasks.filter((task) => task.status !== 2);

    if (!query) {
      return openTasks;
    }

    return openTasks.filter((task) =>
      taskSearchText(task).toLowerCase().includes(query),
    );
  }, [searchText, tasks]);

  async function handleComplete(task: Task) {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Completing task...",
    });

    try {
      await completeTask(task);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      toast.style = Toast.Style.Success;
      toast.title = "Task completed";
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to complete task";
      toast.message = describeApiError(error);
    }
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search Dida365 tasks..."
      onSearchTextChange={setSearchText}
      throttle
    >
      {filteredTasks.map((task) => (
        <TaskItem
          key={`${task.projectId}:${task.id}`}
          task={task}
          onComplete={handleComplete}
          onRefresh={loadTasks}
        />
      ))}
    </List>
  );
}

function TaskItem({
  task,
  onComplete,
  onRefresh,
}: {
  task: Task;
  onComplete: (task: Task) => Promise<void>;
  onRefresh: () => Promise<void>;
}) {
  const priority = priorityAccessory(task.priority);
  const accessories: List.Item.Accessory[] = [
    ...(priority ? [priority] : []),
    task.dueDate
      ? {
          text: formatTaskDate(task.dueDate),
          icon: { source: Icon.Calendar, tintColor: Color.Blue },
        }
      : { text: "No date" },
  ];

  return (
    <List.Item
      icon={Icon.Circle}
      title={task.title}
      subtitle={task.content || task.desc}
      accessories={accessories}
      detail={<List.Item.Detail markdown={task.content || task.desc || ""} />}
      actions={
        <ActionPanel>
          <Action
            title="Complete Task"
            icon={Icon.CheckCircle}
            onAction={() => onComplete(task)}
          />
          <Action.CopyToClipboard
            title="Copy Task Title"
            content={task.title}
          />
          <Action.CopyToClipboard
            title="Copy Task ID"
            content={`taskId=${task.id}\nprojectId=${task.projectId}\npriority=${priorityLabel(task.priority)}`}
          />
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            onAction={onRefresh}
          />
        </ActionPanel>
      }
    />
  );
}
