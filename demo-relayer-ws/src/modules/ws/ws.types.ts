import { Type } from "@sinclair/typebox";

export const WsMessageSchema = Type.Object({
  type: Type.Union([
    Type.Literal("join"),
    Type.Literal("leave-room"),
    Type.Literal("offer"),
    Type.Literal("answer"),
    Type.Literal("ice-candidate"),
    Type.Literal("ping"),
  ]),
  payload: Type.Optional(Type.Any()),
});

export type WsMessageType = typeof WsMessageSchema;

export const WsResponseSchema = Type.Object({
  type: Type.Union([
    Type.Literal("welcome"),
    Type.Literal("echo"),
    Type.Literal("error"),
    Type.Literal("pong"),
    Type.Literal("existing-users"),
    Type.Literal("new-user"),
    Type.Literal("user-left"),
    Type.Literal("offer"),
    Type.Literal("answer"),
    Type.Literal("ice-candidate"),
  ]),
  payload: Type.Any(),
});

export type WsResponse = typeof WsResponseSchema;
