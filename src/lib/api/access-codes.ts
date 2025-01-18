import { getSupabaseClient } from "../supabase";
import { TABLES } from "../constants";
import type { AccessCode } from "../../types";

export async function validateAccessCode(code: string): Promise<boolean> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    // Begin transaction
    const { data: accessCode, error: selectError } = await supabase
      .from(TABLES.ACCESS_CODES)
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (selectError) throw selectError;
    if (!accessCode) return false;

    // Check if code is expired
    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return false;
    }
    window.access_code = accessCode;
    // Record usage
    const { error: usageError } = await supabase
      .from("access_code_uses")
      .insert({
        code_id: accessCode.id,
      });

    if (usageError) throw usageError;

    return true;
  } catch (error) {
    console.error("Error validating access code:", error);
    throw error;
  }
}

export async function getAccessCodes(): Promise<AccessCode[]> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    const { data, error } = await supabase
      .from(TABLES.ACCESS_CODES)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching access codes:", error);
    throw error;
  }
}

export async function createAccessCode(options?: {
  code?: string;
  description?: string;
  expiresAt?: string | null;
}): Promise<AccessCode> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    // Generate random 6-digit code if not provided
    const code =
      options?.code || Math.floor(100000 + Math.random() * 900000).toString();

    const { data, error } = await supabase
      .from(TABLES.ACCESS_CODES)
      .insert({
        code,
        description: options?.description,
        expires_at: options?.expiresAt,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Failed to create access code");

    return data;
  } catch (error) {
    console.error("Error creating access code:", error);
    throw error;
  }
}

export async function updateAccessCode(
  id: string,
  updates: Partial<AccessCode>
): Promise<void> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    const { error } = await supabase
      .from(TABLES.ACCESS_CODES)
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating access code:", error);
    throw error;
  }
}

export async function deleteAccessCode(id: string): Promise<void> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    const { error } = await supabase
      .from(TABLES.ACCESS_CODES)
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting access code:", error);
    throw error;
  }
}
