import { Form, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function TaskForm() {
  const navigation = useNavigation();

  return (
    <Form method="post" className="mb-8 space-y-4">
      <input type="hidden" name="intent" value="create" />
      <div>
        <Input id="title" name="title" placeholder="タスクを入力" required />
      </div>
      <Button type="submit" disabled={navigation.state === "submitting"}>
        タスクを追加
      </Button>
    </Form>
  );
}
