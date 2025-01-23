import { getSupabaseClient } from "../supabase";
import { TABLES } from "../constants";
import type { AccessCode, AccessCodeRequest } from "../../types";

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
  created_by_id?: string;
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
        created_by_id: options?.created_by_id,
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
    // Convert is_active to status if needed
    if ('is_active' in updates) {
      updates.status = updates.is_active ? 'active' : 'inactive';
      delete updates.is_active;
    }

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

export async function getAccessCodeRequests(): Promise<AccessCodeRequest[]> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    const { data, error } = await supabase
      .from('access_code_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching access code requests:", error);
    throw error;
  }
}

export async function submitAccessCodeRequest(data: {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  projectType: string;
  estimatedBudget: string;
  timeline: string;
  additionalInfo?: string;
}): Promise<void> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    const { error } = await supabase
      .from('access_code_requests')
      .insert({
        company_name: data.companyName,
        contact_name: data.contactName,
        email: data.email,
        phone: data.phone,
        project_type: data.projectType,
        estimated_budget: data.estimatedBudget,
        timeline: data.timeline,
        additional_info: data.additionalInfo,
        status: 'pending'
      });

    if (error) throw error;
  } catch (error) {
    console.error("Error submitting access code request:", error);
    throw error;
  }
}

export async function deleteAccessCodeRequest(id: string): Promise<void> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    const { error } = await supabase
      .from('access_code_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting access code request:", error);
    throw error;
  }
}