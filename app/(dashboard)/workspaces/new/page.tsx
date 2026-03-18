import { WorkspaceForm } from "@/features/workspace/workspace-form";

export default function NewWorkspacePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Create workspace</h1>
        <p className="text-muted-foreground">
          Add a new brand or workspace. You can add brand profile details now or
          later.
        </p>
      </div>
      <WorkspaceForm />
    </div>
  );
}
