"use client";

import { Modal } from "@/components/shared/modal";
import { Button } from "@/components/ui/button";
import { useSubscribeModal } from "@/hooks/use-subscribe-modal";

export const SubscribeModal = () => {
  const subscribeModal = useSubscribeModal();

  return (
    <Modal showModal={subscribeModal.isOpen} setShowModal={subscribeModal.onClose}>
      <div className="w-full">
        <div className="flex flex-col items-center justify-center space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
          <h3 className="font-urban text-2xl font-bold">{subscribeModal.isSuccess ? "Subscribe Successfully" : "Subscribe Failed" }</h3>
          <p className="text-sm text-gray-500">
           {subscribeModal.isSuccess ? "Thanks for subscribing MemFree" : "Please check your emain or try again" }
          </p>
        </div>

        <div className="flex flex-col space-y-4 bg-secondary/50 px-4 py-8 md:px-16">
          <Button
            variant="default"
            onClick={() => {
              subscribeModal.onClose();
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};