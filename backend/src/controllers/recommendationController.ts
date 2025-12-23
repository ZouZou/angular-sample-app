import { Request, Response } from 'express';
import { recommendationService } from '../services/recommendationService';

class RecommendationController {
  /**
   * GET /api/recommendations/for-me?limit=10
   * Get personalized recommendations for the authenticated user
   */
  async getPersonalizedRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const excludeEnrolled = req.query.excludeEnrolled !== 'false'; // Default true

      const recommendations = await recommendationService.getRecommendationsForUser(
        userId,
        { limit, excludeEnrolled }
      );

      res.json(recommendations);
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      res.status(500).json({ message: 'Failed to get recommendations' });
    }
  }

  /**
   * GET /api/recommendations/similar/:courseId?limit=5
   * Get courses similar to a specific course (public)
   */
  async getSimilarCourses(req: Request, res: Response): Promise<void> {
    try {
      const courseId = parseInt(req.params.courseId);

      if (isNaN(courseId)) {
        res.status(400).json({ message: 'Invalid course ID' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 5;

      const recommendations = await recommendationService.getSimilarCourses(
        courseId,
        limit
      );

      res.json(recommendations);
    } catch (error) {
      console.error('Error getting similar courses:', error);
      res.status(500).json({ message: 'Failed to get similar courses' });
    }
  }

  /**
   * GET /api/recommendations/next/:courseId
   * Get suggested next course after completing a course
   */
  async getNextCourse(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const courseId = parseInt(req.params.courseId);

      if (isNaN(courseId)) {
        res.status(400).json({ message: 'Invalid course ID' });
        return;
      }

      const recommendation = await recommendationService.getNextCourse(
        courseId,
        userId
      );

      if (!recommendation) {
        res.status(404).json({ message: 'No next course found' });
        return;
      }

      res.json(recommendation);
    } catch (error) {
      console.error('Error getting next course:', error);
      res.status(500).json({ message: 'Failed to get next course' });
    }
  }

  /**
   * GET /api/recommendations/popular?limit=10
   * Get popular/trending courses (public)
   */
  async getPopularCourses(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const recommendations = await recommendationService.getPopularCourses(limit);

      res.json(recommendations);
    } catch (error) {
      console.error('Error getting popular courses:', error);
      res.status(500).json({ message: 'Failed to get popular courses' });
    }
  }

  /**
   * DELETE /api/recommendations/cache
   * Clear recommendation caches (admin only)
   */
  async clearCache(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;

      if (userRole !== 'admin') {
        res.status(403).json({ message: 'Admin access required' });
        return;
      }

      recommendationService.clearCache();

      res.json({ message: 'Recommendation cache cleared successfully' });
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({ message: 'Failed to clear cache' });
    }
  }
}

export const recommendationController = new RecommendationController();
