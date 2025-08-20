import { type User, type InsertUser, type UserProfile, type InsertUserProfile } from "../shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(userId: string, profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userProfiles: Map<string, UserProfile>;

  constructor() {
    this.users = new Map();
    this.userProfiles = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createUserProfile(userId: string, profile: InsertUserProfile): Promise<UserProfile> {
    const id = randomUUID();
    const userProfile: UserProfile = { 
      ...profile, 
      id, 
      userId,
      completed: profile.completed || {}
    };
    this.userProfiles.set(id, userProfile);
    return userProfile;
  }

  async updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const existingProfile = await this.getUserProfile(userId);
    if (!existingProfile) return undefined;

    const updatedProfile: UserProfile = { 
      ...existingProfile, 
      ...profile 
    };
    this.userProfiles.set(existingProfile.id, updatedProfile);
    return updatedProfile;
  }
}

export const storage = new MemStorage();
