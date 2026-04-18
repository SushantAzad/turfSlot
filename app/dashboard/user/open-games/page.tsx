"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOpenGames } from "@/hooks/useData";
import { matchmakingQueries } from "@/lib/supabase/queries";
import toast from "react-hot-toast";

export default function OpenGamesPage() {
  const { user } = useAuth();
  const { games, isLoading, refetch } = useOpenGames();
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);

  const handleJoinGame = async (gameId: string) => {
    if (!user) {
      toast.error("You must be logged in to join a game");
      return;
    }

    try {
      setJoiningGameId(gameId);
      await matchmakingQueries.joinOpenGame(gameId, user.id);
      toast.success("Successfully joined the game! Please arrive on time.");
      refetch(); // Reload the list
    } catch (err: any) {
      toast.error(err.message || "Failed to join. The match might be full.");
    } finally {
      setJoiningGameId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Open Games 🫂</h1>
        <p className="text-sm text-gray-500">Join existing matches and split the fee!</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="loading-spinner"></div>
        </div>
      ) : games.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">⚽</div>
          <p className="text-gray-500 text-lg">
            No open games are looking for players right now.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Tip: Book a turf yourself and host a match from your Bookings page!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="card hover:shadow-lg transition-shadow">
              
              {/* Turf Image / Header */}
              <div className="h-40 -mx-6 -mt-6 rounded-t-xl overflow-hidden mb-4 relative bg-gray-100">
                {game.turf?.images_urls && game.turf.images_urls.length > 0 ? (
                  <img
                    src={game.turf.images_urls[0]}
                    alt={game.turf.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-800 border border-blue-100">
                  {game.available_spots} spots left
                </div>
              </div>

              <h3 className="text-xl font-bold mb-1">{game.turf?.name}</h3>
              <p className="text-gray-600 text-sm mb-4 truncate">
                📍 {game.turf?.location}
              </p>

              <div className="space-y-2 mb-6 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="flex justify-between">
                  <span className="text-gray-500">Host:</span>
                  <strong className="truncate max-w-[60%] text-right">{game.host?.full_name || game.host?.email}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <strong>
                    {new Date(game.booking?.slot?.slot_date || "").toLocaleDateString()}
                  </strong>
                </p>
                <p className="flex justify-between">
                   <span className="text-gray-500">Time:</span>
                   <strong>
                     {game.booking?.slot?.start_time} - {game.booking?.slot?.end_time}
                   </strong>
                </p>
                <p className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-600 font-medium">Split Fee (per player):</span>
                  <strong className="text-blue-600 text-base">₹{game.split_fee}</strong>
                </p>
              </div>

              {game.host_id === user?.id ? (
                <button
                  disabled
                  className="btn btn-secondary w-full opacity-50 cursor-not-allowed"
                >
                  You are hosting this match
                </button>
              ) : (
                <button
                  onClick={() => handleJoinGame(game.id)}
                  disabled={joiningGameId === game.id}
                  className="btn btn-primary w-full shadow-md shadow-blue-500/20"
                >
                  {joiningGameId === game.id ? "Joining..." : "Join Match"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
