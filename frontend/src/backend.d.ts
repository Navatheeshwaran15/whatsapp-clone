import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface UserProfile {
    status: string;
    username: string;
    lastActive: Time;
    avatar: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllUserProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(target: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    isUserOnline(user: Principal): Promise<boolean>;
    registerUser(username: string, avatar: string, status: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendImageMessage(conversationId: string, content: string, imageBlob: Uint8Array): Promise<void>;
    sendMessage(conversationId: string, content: string): Promise<void>;
    updateStatus(status: string): Promise<void>;
}
