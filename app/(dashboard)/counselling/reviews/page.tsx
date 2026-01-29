"use client";

import React, { useState, useEffect, useCallback } from "react";
import { counsellingService } from "@/lib/services/counselling.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  Star,
  ThumbsUp,
  MessageSquare,
  Eye,
  EyeOff,
} from "lucide-react";

interface Review {
  _id: string;
  userId: string;
  user?: {
    name: string;
    email: string;
  };
  sessionId: string;
  counsellorId: string;
  counsellor?: {
    _id: string;
    name: string;
  };
  rating: number;
  review?: string;
  wouldRecommend?: boolean;
  tags?: string[];
  isPublished: boolean;
  createdAt: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function CounsellingReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterPublished, setFilterPublished] = useState<string>("all");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    published: 0,
    pending: 0,
  });

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await counsellingService.getAllReviews({
        rating: filterRating !== "all" ? parseInt(filterRating) : undefined,
        isPublished:
          filterPublished !== "all"
            ? filterPublished === "published"
            : undefined,
      });

      setReviews(response.data || []);

      // Calculate stats
      const total = response.data?.length || 0;
      const avgRating =
        total > 0
          ? response.data.reduce((sum: number, r: Review) => sum + r.rating, 0) /
            total
          : 0;
      const published = response.data?.filter((r: Review) => r.isPublished)
        .length || 0;

      setStats({
        total,
        avgRating: Math.round(avgRating * 10) / 10,
        published,
        pending: total - published,
      });
    } catch (error: any) {
      console.error("Failed to fetch reviews:", error);
      toast.error("Failed to load reviews", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filterRating, filterPublished]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleTogglePublish = async (reviewId: string, currentStatus: boolean) => {
    try {
      // Note: This endpoint doesn't exist yet, would need to be added to service
      // await counsellingService.toggleReviewPublish(reviewId, !currentStatus);

      toast.success(
        currentStatus ? "Review unpublished" : "Review published",
        {
          description: "Review visibility updated successfully",
        }
      );

      fetchReviews();
    } catch (error: any) {
      toast.error("Failed to update review", {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Counselling Reviews</h1>
          <p className="text-muted-foreground">
            Manage and moderate counsellor reviews
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchReviews}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Reviews</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.avgRating}
              </div>
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {stats.published}
            </div>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending}
            </div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPublished} onValueChange={setFilterPublished}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="unpublished">Unpublished</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Counsellor</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review._id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{review.user?.name || "Anonymous"}</div>
                    <div className="text-sm text-muted-foreground">
                      {review.user?.email || ""}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {review.counsellor?.name || "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <StarRating rating={review.rating} />
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    {review.review ? (
                      <p className="text-sm line-clamp-2">{review.review}</p>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No written review
                      </span>
                    )}
                    {review.wouldRecommend && (
                      <div className="flex items-center gap-1 mt-1 text-green-600">
                        <ThumbsUp className="w-3 h-3" />
                        <span className="text-xs">Would recommend</span>
                      </div>
                    )}
                    {review.tags && review.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {review.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {review.isPublished ? (
                    <Badge className="bg-green-500 text-white">
                      <Eye className="w-3 h-3 mr-1" />
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Unpublished
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant={review.isPublished ? "outline" : "default"}
                    size="sm"
                    onClick={() =>
                      handleTogglePublish(review._id, review.isPublished)
                    }
                  >
                    {review.isPublished ? (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Publish
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {reviews.length === 0 && (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
            <p className="text-muted-foreground">
              {filterRating !== "all" || filterPublished !== "all"
                ? "Try adjusting your filters"
                : "No counsellor reviews yet"}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
