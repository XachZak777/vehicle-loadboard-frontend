import { useParams, useNavigate } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import {
  Building2,
  Mail,
  Phone,
  Shield,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Star,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Calendar,
  Award,
} from 'lucide-react';
import { getUserRatingStats } from '../services/ratingService';
import { useEffect, useState } from 'react';
import { UserRatingStats } from '../types/rating';

export function CompanyPublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [ratingStats, setRatingStats] = useState<UserRatingStats | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  const getRatingLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Great';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  useEffect(() => {
    if (userId) {
      // Get company info from registered users
      const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const company = users.find((u: any) => u.id === userId);

      if (company) {
        setCompanyInfo(company);
        const stats = getUserRatingStats(userId, company.companyName, company.role);
        setRatingStats(stats);
      }
    }
  }, [userId]);

  if (!companyInfo || !ratingStats) {
    return (
      <div className="min-h-screen bg-background map-background-detailed">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Company not found</p>
              <Button onClick={() => navigate('/loads')} className="mt-4">
                Back to Load Board
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background map-background-detailed">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>

          {/* Company Header Card */}
          <Card className="border">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold truncate">{companyInfo.companyName}</h1>
                  <Badge variant="secondary" className="capitalize mt-2 text-sm">
                    {companyInfo.role}
                  </Badge>
                </div>
              </div>

              {/* Rating Score */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="text-sm uppercase tracking-wide text-muted-foreground mb-2">Overall Rating Score</div>
                  <div className="flex items-baseline gap-3">
                    <div className="text-6xl sm:text-7xl font-bold">{ratingStats.ratingPercentage}%</div>
                    <div className="text-2xl font-semibold text-muted-foreground">{getRatingLabel(ratingStats.ratingPercentage)}</div>
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    Based on {ratingStats.totalRatings} rating{ratingStats.totalRatings !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="text-center p-4 border rounded-none">
                    <ThumbsUp className="size-6 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{ratingStats.positiveRatings}</div>
                    <div className="text-xs text-muted-foreground">Positive</div>
                  </div>
                  <div className="text-center p-4 border rounded-none">
                    <ThumbsDown className="size-6 mx-auto mb-2 text-red-600" />
                    <div className="text-2xl font-bold">{ratingStats.negativeRatings}</div>
                    <div className="text-xs text-muted-foreground">Negative</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {ratingStats.totalRatings > 0 && (
                <div className="mt-6">
                  <Progress value={ratingStats.ratingPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Breakdown */}
          {ratingStats.totalRatings > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
                <CardDescription>Detailed feedback statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {ratingStats.carrierCriteriaStats && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 border rounded-none">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-base">Proper Communication</div>
                        <Badge variant="secondary">
                          {Math.round((ratingStats.carrierCriteriaStats.properCommunication / ratingStats.totalRatings) * 100)}%
                        </Badge>
                      </div>
                      <div className="text-3xl font-bold">
                        {ratingStats.carrierCriteriaStats.properCommunication}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">out of {ratingStats.totalRatings} ratings</div>
                      <Progress
                        value={(ratingStats.carrierCriteriaStats.properCommunication / ratingStats.totalRatings) * 100}
                        className="mt-3 h-2"
                      />
                    </div>

                    <div className="p-5 border rounded-none">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-base">On-Time Payment</div>
                        <Badge variant="secondary">
                          {Math.round((ratingStats.carrierCriteriaStats.onTimePayment / ratingStats.totalRatings) * 100)}%
                        </Badge>
                      </div>
                      <div className="text-3xl font-bold">
                        {ratingStats.carrierCriteriaStats.onTimePayment}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">out of {ratingStats.totalRatings} ratings</div>
                      <Progress
                        value={(ratingStats.carrierCriteriaStats.onTimePayment / ratingStats.totalRatings) * 100}
                        className="mt-3 h-2"
                      />
                    </div>

                    <div className="p-5 border rounded-none">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-base">Accurate Details</div>
                        <Badge variant="secondary">
                          {Math.round((ratingStats.carrierCriteriaStats.accurateLoadDetails / ratingStats.totalRatings) * 100)}%
                        </Badge>
                      </div>
                      <div className="text-3xl font-bold">
                        {ratingStats.carrierCriteriaStats.accurateLoadDetails}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">out of {ratingStats.totalRatings} ratings</div>
                      <Progress
                        value={(ratingStats.carrierCriteriaStats.accurateLoadDetails / ratingStats.totalRatings) * 100}
                        className="mt-3 h-2"
                      />
                    </div>
                  </div>
                )}

                {ratingStats.brokerCriteriaStats && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 border rounded-none">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-base">Proper Communication</div>
                        <Badge variant="secondary">
                          {Math.round((ratingStats.brokerCriteriaStats.properCommunication / ratingStats.totalRatings) * 100)}%
                        </Badge>
                      </div>
                      <div className="text-3xl font-bold">
                        {ratingStats.brokerCriteriaStats.properCommunication}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">out of {ratingStats.totalRatings} ratings</div>
                      <Progress
                        value={(ratingStats.brokerCriteriaStats.properCommunication / ratingStats.totalRatings) * 100}
                        className="mt-3 h-2"
                      />
                    </div>

                    <div className="p-5 border rounded-none">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-base">On-Time Transport</div>
                        <Badge variant="secondary">
                          {Math.round((ratingStats.brokerCriteriaStats.onTimeTransport / ratingStats.totalRatings) * 100)}%
                        </Badge>
                      </div>
                      <div className="text-3xl font-bold">
                        {ratingStats.brokerCriteriaStats.onTimeTransport}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">out of {ratingStats.totalRatings} ratings</div>
                      <Progress
                        value={(ratingStats.brokerCriteriaStats.onTimeTransport / ratingStats.totalRatings) * 100}
                        className="mt-3 h-2"
                      />
                    </div>

                    <div className="p-5 border rounded-none">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-base">Safety</div>
                        <Badge variant="secondary">
                          {Math.round((ratingStats.brokerCriteriaStats.safety / ratingStats.totalRatings) * 100)}%
                        </Badge>
                      </div>
                      <div className="text-3xl font-bold">
                        {ratingStats.brokerCriteriaStats.safety}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">out of {ratingStats.totalRatings} ratings</div>
                      <Progress
                        value={(ratingStats.brokerCriteriaStats.safety / ratingStats.totalRatings) * 100}
                        className="mt-3 h-2"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Contact and verification details</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email Address</label>
                  <div className="flex items-center gap-3 p-3 border rounded-none">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-sm sm:text-base break-all">{companyInfo.email}</p>
                  </div>
                </div>
                {companyInfo.phoneNumber && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone Number</label>
                    <div className="flex items-center gap-3 p-3 border rounded-none">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium text-sm sm:text-base">{companyInfo.phoneNumber}</p>
                    </div>
                  </div>
                )}
              </div>

              {companyInfo.role !== 'dealer' && (companyInfo.mcNumber || companyInfo.dotNumber) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                  {companyInfo.mcNumber && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">MC Number</label>
                      <div className="flex items-center gap-3 p-3 border rounded-none">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium text-sm sm:text-base">{companyInfo.mcNumber}</p>
                      </div>
                    </div>
                  )}
                  {companyInfo.dotNumber && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">DOT Number</label>
                      <div className="flex items-center gap-3 p-3 border rounded-none">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium text-sm sm:text-base">{companyInfo.dotNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          {ratingStats.recentRatings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest feedback from customers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ratingStats.recentRatings.map((rating) => (
                  <div key={rating.id} className="p-4 border rounded-none">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {rating.ratingType === 'positive' ? (
                          <ThumbsUp className="size-5 text-green-600" />
                        ) : (
                          <ThumbsDown className="size-5 text-red-600" />
                        )}
                        <div>
                          <div className="font-semibold text-base">{rating.reviewerName}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="capitalize text-xs">
                              {rating.reviewerRole}
                            </Badge>
                            <span>•</span>
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {rating.vehicleInfo && (
                      <div className="text-xs text-muted-foreground mb-2">Load: {rating.vehicleInfo}</div>
                    )}

                    {rating.comment && (
                      <p className="text-sm bg-muted p-3 rounded-none mb-3">
                        "{rating.comment}"
                      </p>
                    )}

                    {rating.carrierCriteria && (
                      <div className="flex flex-wrap gap-2">
                        {rating.carrierCriteria.properCommunication && (
                          <Badge variant="secondary">Proper Communication</Badge>
                        )}
                        {rating.carrierCriteria.onTimePayment && (
                          <Badge variant="secondary">On-Time Payment</Badge>
                        )}
                        {rating.carrierCriteria.accurateLoadDetails && (
                          <Badge variant="secondary">Accurate Details</Badge>
                        )}
                      </div>
                    )}

                    {rating.brokerCriteria && (
                      <div className="flex flex-wrap gap-2">
                        {rating.brokerCriteria.properCommunication && (
                          <Badge variant="secondary">Proper Communication</Badge>
                        )}
                        {rating.brokerCriteria.onTimeTransport && (
                          <Badge variant="secondary">On-Time Transport</Badge>
                        )}
                        {rating.brokerCriteria.safety && (
                          <Badge variant="secondary">Safety</Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {ratingStats.totalRatings === 0 && (
            <Card>
              <CardContent className="py-16 text-center">
                <h3 className="text-xl font-semibold mb-2">No Ratings Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  This company hasn't received any ratings yet. Be the first to share your experience after completing a transaction.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
