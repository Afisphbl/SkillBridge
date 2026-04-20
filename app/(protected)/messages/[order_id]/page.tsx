"use client";

import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { OrderChatComposer } from "@/components/Messages/OrderChatComposer";
import { OrderChatContent } from "@/components/Messages/OrderChatContent";
import { OrderChatHeader } from "@/components/Messages/OrderChatHeader";
import { useOrderChat } from "@/hooks/messages/useOrderChat";

export default function MessageDetailsPage() {
  const params = useParams<{ order_id?: string; orderId?: string }>();
  const searchParams = useSearchParams();

  const orderId = useMemo(() => {
    const raw = params?.order_id || params?.orderId || "";
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const peerId = searchParams.get("peerId") || "";
  const peerName = searchParams.get("peerName") || "Conversation";

  const {
    bottomAnchorRef,
    currentUserId,
    errorMessage,
    handleSend,
    hasConversationContext,
    isLoading,
    isSending,
    messageInput,
    refetchMessages,
    setMessageInput,
    sortedMessages,
  } = useOrderChat({ orderId, peerId });

  return (
    <section className="flex h-[calc(100vh-8.25rem)] flex-col overflow-hidden rounded-3xl border border-(--border-color) bg-(--bg-card) shadow-[0_18px_44px_-26px_rgba(15,23,42,0.75)]">
      <OrderChatHeader orderId={orderId} peerName={peerName} />

      <OrderChatContent
        bottomAnchorRef={bottomAnchorRef}
        currentUserId={currentUserId}
        errorMessage={errorMessage}
        hasConversationContext={hasConversationContext}
        isLoading={isLoading}
        onRetry={refetchMessages}
        sortedMessages={sortedMessages}
      />

      <OrderChatComposer
        disabled={!hasConversationContext || Boolean(errorMessage) || isSending}
        isSending={isSending}
        messageInput={messageInput}
        onSend={handleSend}
        setMessageInput={setMessageInput}
      />
    </section>
  );
}
