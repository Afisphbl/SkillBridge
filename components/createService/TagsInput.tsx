"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";

export default function TagsInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draftTag, setDraftTag] = useState("");

  const addTag = () => {
    const cleaned = draftTag.trim().toLowerCase();
    if (!cleaned || tags.includes(cleaned)) {
      setDraftTag("");
      return;
    }

    onChange([...tags, cleaned]);
    setDraftTag("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((item) => item !== tag));
  };

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-semibold text-(--text-secondary)">
        Tags
      </span>

      <div className="flex gap-2">
        <input
          value={draftTag}
          onChange={(event) => setDraftTag(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addTag();
            }
          }}
          placeholder="Press Enter to add tag"
          className="soft-field h-11 w-full rounded-md px-3 text-sm focus:border-(--input-border-focus) focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />

        <button
          type="button"
          onClick={addTag}
          className="inline-flex h-11 items-center rounded-md border border-(--border-color) bg-(--btn-bg-secondary) px-4 text-sm font-semibold text-(--btn-text-secondary) hover:bg-(--btn-bg-secondary-hover)"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-(--border-color) bg-(--bg-secondary) px-2.5 py-1 text-xs font-semibold text-(--text-secondary)"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
              className="grid size-4 place-items-center rounded-full text-(--text-muted) hover:bg-(--hover-bg)"
            >
              <FiX className="size-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
