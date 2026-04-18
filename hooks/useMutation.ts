"use client";

import { useState } from "react";
import type { ApiResponse } from "@/types";

interface UseMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: UseMutationOptions,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = async (variables: TVariables) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);

      if (result.success && result.data) {
        setData(result.data);
        options?.onSuccess?.(result.data);
      } else {
        const errorMessage =
          result.error || result.message || "An error occurred";
        setError(errorMessage);
        options?.onError?.(errorMessage);
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred";
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setData(null);
  };

  return { mutate, isLoading, error, data, reset };
};

// Common API call hook
export const useApi = () => {
  const post = async <T = any>(
    url: string,
    body: any,
  ): Promise<ApiResponse<T>> => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch");
    }

    return response.json();
  };

  const patch = async <T = any>(
    url: string,
    body: any,
  ): Promise<ApiResponse<T>> => {
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch");
    }

    return response.json();
  };

  const get = async <T = any>(url: string): Promise<ApiResponse<T>> => {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch");
    }

    return response.json();
  };

  const del = async <T = any>(url: string): Promise<ApiResponse<T>> => {
    const response = await fetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch");
    }

    return response.json();
  };

  return { post, patch, get, del };
};
