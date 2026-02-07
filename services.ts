
import { Indent, Bid, BidStatus } from './types';
import { MOCK_INDENTS } from './constants';

/**
 * PROCUREMENT SERVICE
 * Bridges the Frontend with the Python/Firebase Backend.
 * Supports both mock mode (localStorage) and production mode (API calls)
 */

// Configuration: Set to true to use mock data, false to use backend API
const USE_MOCK_MODE = false; // Change to false when backend is deployed

// Backend API URL - Update this when deploying backend
const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const API_BASE_URL = `${BASE_URL}/api/v1`;

export class ProcurementService {
  // Local cache for mock mode
  private static storageKey = 'tvs_procurement_data';

  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  // Removed unused register and verifyToken methods

  private static getStoredData(): { indents: Indent[], bids: Bid[] } {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) return JSON.parse(saved);
    return { indents: MOCK_INDENTS, bids: [] };
  }

  private static saveData(data: { indents: Indent[], bids: Bid[] }) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * FETCH ALL INDENTS
   * Mock: localStorage
   * Production: GET /api/v1/indents
   */
  static async getIndents(): Promise<Indent[]> {
    if (USE_MOCK_MODE) {
      // Mock mode: Use localStorage
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.getStoredData().indents;
    } else {
      // Production mode: Call backend API
      const abortController = new AbortController();

      try {
        const response = await fetch(`${API_BASE_URL}/indents`, {
          headers: this.getAuthHeaders(),
          signal: abortController.signal
        });

        if (!response.ok) {
          console.error(`Failed to fetch indents: HTTP ${response.status}`);
          return []; // Return empty array instead of throwing
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Fetch indents request cancelled');
          return [];
        }

        console.error('Error fetching indents:', error);
        return []; // Return empty array to prevent white screen
      }
    }
  }

  /**
   * CREATE NEW INDENT
   * Mock: localStorage
   * Production: POST /api/v1/indents
   */
  static async createIndent(indent: Indent): Promise<Indent> {
    if (USE_MOCK_MODE) {
      // Mock mode: Save to localStorage
      const data = this.getStoredData();
      data.indents = [indent, ...data.indents];
      this.saveData(data);
      return indent;
    } else {
      // Production mode: Call backend API
      const abortController = new AbortController();

      try {
        const response = await fetch(`${API_BASE_URL}/indents`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            requestId: indent.requestId,
            lane: indent.lane,
            vehicleType: indent.vehicleType,
            vehicleCapacity: indent.vehicleCapacity,
            placementDate: indent.placementDate,
            cutoffTime: indent.cutoffTime,
            product: indent.product,
            weight: indent.weight,
            notes: indent.notes,
            estimatedPrice: indent.estimatedPrice,
          }),
          signal: abortController.signal
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `HTTP ${response.status}: Failed to create indent`);
        }

        const data = await response.json();
        return data;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Create indent request cancelled');
          throw new Error('Request cancelled');
        }

        console.error('Error creating indent:', error);
        throw error;
      }
    }
  }

  /**
   * SUBMIT A BID
   * Mock: localStorage with client-side logic
   * Production: POST /api/v1/bids (server handles indent update via transaction)
   */
  static async submitBid(bid: Bid): Promise<void> {
    if (USE_MOCK_MODE) {
      // Mock mode: Update localStorage
      const data = this.getStoredData();
      data.bids = [...data.bids, bid];

      // Server-side logic simulated here: Update indent lowest bid
      data.indents = data.indents.map(i => {
        if (i.id === bid.indentId) {
          const currentLowest = i.lowestBid || Infinity;
          const isNewLowest = bid.amount < currentLowest;
          return {
            ...i,
            lowestBid: Math.min(currentLowest, bid.amount),
            lowestBidVendorName: isNewLowest ? bid.vendorName : i.lowestBidVendorName,
            bidCount: i.bidCount + 1,
            status: BidStatus.IN_PROGRESS
          };
        }
        return i;
      });

      this.saveData(data);
    } else {
      // Production mode: Call backend API
      // Backend will handle indent update via transaction
      const abortController = new AbortController();

      try {
        const response = await fetch(`${API_BASE_URL}/bids`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            indentId: bid.indentId,
            vendorId: bid.vendorId,
            vendorName: bid.vendorName,
            amount: bid.amount,
          }),
          signal: abortController.signal
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `HTTP ${response.status}: Failed to submit bid`);
        }

        await response.json();
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Submit bid request cancelled');
          throw new Error('Request cancelled');
        }

        console.error('Error submitting bid:', error);
        throw error;
      }
    }
  }

  /**
   * GET BIDS FOR INDENT
   * Mock: localStorage
   * Production: GET /api/v1/bids/indent/{indentId}
   */
  static async getBids(indentId: string): Promise<Bid[]> {
    if (USE_MOCK_MODE) {
      // Mock mode: Filter from localStorage
      const data = this.getStoredData();
      return data.bids.filter(b => b.indentId === indentId);
    } else {
      // Production mode: Call backend API
      const abortController = new AbortController();

      try {
        const response = await fetch(`${API_BASE_URL}/bids/indent/${indentId}`, {
          headers: this.getAuthHeaders(),
          signal: abortController.signal
        });

        if (!response.ok) {
          console.error(`Failed to fetch bids: HTTP ${response.status}`);
          return []; // Return empty array instead of throwing
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Fetch bids request cancelled');
          return [];
        }

        console.error('Error fetching bids:', error);
        return []; // Return empty array to prevent errors
      }
    }
  }

  /**
   * REAL-TIME UPDATES
   * Mock: Polling with setInterval
   * Production: Firebase onSnapshot or polling
   */
  static subscribeToIndents(callback: (indents: Indent[]) => void) {
    const interval = setInterval(async () => {
      try {
        const indents = await this.getIndents();
        callback(indents);
      } catch (error) {
        console.error('Error in subscription:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }

  /**
   * GET ANALYTICS TRENDS
   * Production: GET /api/v1/analytics/trends
   */
  static async getAnalyticsTrends(): Promise<{
    avg_reduction: number;
    total_savings: number;
    volume: number;
  }> {
    if (USE_MOCK_MODE) {
      // Mock mode: Calculate from localStorage
      const data = this.getStoredData();
      let totalSavings = 0;
      let totalEstimated = 0;

      data.indents.forEach(indent => {
        if (indent.lowestBid) {
          totalSavings += (indent.estimatedPrice - indent.lowestBid);
          totalEstimated += indent.estimatedPrice;
        }
      });

      const avgReduction = totalEstimated > 0 ? (totalSavings / totalEstimated) * 100 : 0;

      return {
        avg_reduction: parseFloat(avgReduction.toFixed(2)),
        total_savings: parseFloat(totalSavings.toFixed(2)),
        volume: data.indents.length
      };
    } else {
      // Production mode: Call backend API
      const abortController = new AbortController();

      try {
        const response = await fetch(`${API_BASE_URL}/analytics/trends`, {
          headers: this.getAuthHeaders(),
          signal: abortController.signal
        });

        if (!response.ok) {
          console.error(`Failed to fetch analytics: HTTP ${response.status}`);
          // Return default values instead of throwing
          return {
            avg_reduction: 0,
            total_savings: 0,
            volume: 0
          };
        }

        return await response.json();
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Fetch analytics request cancelled');
          return {
            avg_reduction: 0,
            total_savings: 0,
            volume: 0
          };
        }

        console.error('Error fetching analytics:', error);
        // Return default values to prevent errors
        return {
          avg_reduction: 0,
          total_savings: 0,
          volume: 0
        };
      }
    }
  }
}

