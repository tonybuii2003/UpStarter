// pages/founders-chat.jsx
"use client";

import React, { useRef } from "react";
import { Thread } from "@assistant-ui/react-ui";            // or "@/components/assistant-ui"
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useLangGraphRuntime } from "@assistant-ui/react-langgraph";

import { createThread, getThreadState, sendMessage } from "../lib/chatApi"; 

export default function FoundersChatWeb() {
  const threadIdRef = useRef();

  const runtime = useLangGraphRuntime({
    threadId: threadIdRef.current,
    stream: async (messages) => {
      if (!threadIdRef.current) {
        const { thread_id } = await createThread();
        threadIdRef.current = thread_id;
      }
      return sendMessage({
        threadId: threadIdRef.current,
        messages,
      });
    },
    onSwitchToNewThread: async () => {
      const { thread_id } = await createThread();
      threadIdRef.current = thread_id;
    },
    onSwitchToThread: async (threadId) => {
      const state = await getThreadState(threadId);
      threadIdRef.current = threadId;
      return {
        messages: state.values.messages,
        interrupts: state.tasks[0]?.interrupts,
      };
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div style={{ height: "100vh" }}>
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
