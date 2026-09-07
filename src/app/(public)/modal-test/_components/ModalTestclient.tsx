"use client";

import { useState } from "react";

import { ReceivedRequestCard } from "@/features/mover-requests/components/ReceivedRequestCard";
import { RejectRequestModal } from "@/features/mover-requests/components/RejectRequestModal";
import { SendQuoteModal } from "@/features/mover-requests/components/SendQuoteModal";
import type {
  ReceivedRequestViewModel,
  RejectRequestFormValue,
  SendQuoteFormValue,
} from "@/features/mover-requests/mover-requests.types";

import styles from "./ModalTestClient.module.css";

const DEFAULT_REQUEST: ReceivedRequestViewModel = {
  requestId: "request-1",
  customerName: "김인서",
  moveTypeLabel: "소형이사",
  isDesignated: true,
  requestedAt: "2026-07-01T09:00:00+09:00",
  requestedAtLabel: "1시간 전",
  departureLabel: "서울시 중구",
  arrivalLabel: "경기도 수원시",
  moveDate: "2026-07-01",
  moveDateLabel: "2026년 07월 01일 (월)",
};

const MOCK_REQUEST: ReceivedRequestViewModel[] = [
  DEFAULT_REQUEST,
  {
    requestId: "request-2",
    customerName: "박무빙",
    moveTypeLabel: "가정이사",
    isDesignated: false,
    requestedAt: "2026-07-01T08:00:00+09:00",
    requestedAtLabel: "2시간 전",
    departureLabel: "서울시 마포구",
    arrivalLabel: "인천시 연수구",
    moveDate: "2026-07-08",
    moveDateLabel: "2026년 07월 08일 (월)",
  },
];

type ActiveModal = "quote" | "reject" | null;

type SubmissionResult =
  | {
      type: "quote";
      customerName: string;
      value: SendQuoteFormValue;
    }
  | {
      type: "reject";
      customerName: string;
      value: RejectRequestFormValue;
    };

export function ModalTestClient() {}
