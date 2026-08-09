import React, { useState, useMemo } from 'react';
import { Star, ThumbsUp, ThumbsDown, CheckCircle, X, ChevronDown, MessageSquare, Edit3 } from 'lucide-react';

const DUMMY_REVIEWS = [
  {
    id: 1,
    name: "Ali Raza",
    rating: 5,
    date: "2 days ago",
    text: "Excellent paper quality! The A4 sheets are super smooth and perfect for both laser and inkjet printing. Will definitely order again.",
    verified: true,
    helpful: 12,
  },
  {
    id: 2,
    name: "Sara Khan",
    rating: 4,
    date: "1 week ago",
    text: "Good quality paper, but the delivery took a day longer than expected. Otherwise, completely satisfied with the product.",
    verified: true,
    helpful: 5,
  },
  {
    id: 3,
    name: "Usman Tariq",
    rating: 5,
    date: "2 weeks ago",
    text: "The bundle pricing is very reasonable. I bought 5 reams and the packaging was solid. No damaged corners.",
    verified: true,
    helpful: 8,
  },
  {
    id: 4,
    name: "Ayesha Ahmed",
    rating: 3,
    date: "1 month ago",
    text: "Decent paper for draft printing. A bit too thin for double-sided color printing, but works fine for regular text.",
    verified: false,
    helpful: 2,
  },
  {
    id: 5,
    name: "Zainab Ali",
    rating: 5,
    date: "1 month ago",
    text: "Best customer service and top notch quality. Highly recommended for office use.",
    verified: true,
    helpful: 15,
  }
];

const Reviews = () => {
  const [reviews, setReviews] = useState(DUMMY_REVIEWS);
  const [filterStar, setFilterStar] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', text: '', rating: 5 });

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1);
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { starCounts[r.rating] = (starCounts[r.rating] || 0) + 1 });

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];
    
    if (filterStar !== 'All') {
      result = result.filter(r => r.rating === parseInt(filterStar));
    }
    
    if (sortBy === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      result.sort((a, b) => a.rating - b.rating);
    }
    
    return result;
  }, [reviews, filterStar, sortBy]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) return;

    const reviewToAdd = {
      id: Date.now(),
      name: newReview.name,
      rating: newReview.rating,
      date: "Just now",
      text: newReview.text,
      verified: true,
      helpful: 0
    };
    
    setReviews([reviewToAdd, ...reviews]);
    setIsModalOpen(false);
    setNewReview({ name: '', text: '', rating: 5 });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={i < rating ? "fill-primary text-primary" : "text-gray-300"} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#111111] pb-24 font-sans selection:bg-primary/20">
      
      {/* Header Section */}
      <div className="relative pt-8 pb-12 px-6 overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <MessageSquare className="text-primary" size={24} />
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Customer Reviews</h1>
          </div>

          <div className="grid md:grid-cols-[1fr_2fr] gap-8 bg-gray-50 p-6 rounded-3xl border border-gray-200">
            
            {/* Rating Summary */}
            <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 md:pr-6">
              <div className="text-6xl font-bold text-[#111111] mb-2">{averageRating}</div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className={i < Math.round(averageRating) ? "fill-primary text-primary" : "text-gray-300"} />
                ))}
              </div>
              <p className="text-gray-500 text-sm font-medium">Based on {totalReviews} reviews</p>
            </div>

            {/* Rating Bars */}
            <div className="flex flex-col justify-center gap-2">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm text-gray-700 font-bold">{star}</span>
                    <Star size={12} className="text-gray-400 fill-gray-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${(starCounts[star] / totalReviews) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-xs text-gray-500 font-medium">{starCounts[star]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls & List */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilterStar('All')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${filterStar === 'All' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map(star => (
              <button 
                key={star}
                onClick={() => setFilterStar(star)}
                className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 transition-colors border ${filterStar === star ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                {star} <Star size={12} className={filterStar === star ? 'fill-white' : 'fill-gray-400'} />
              </button>
            ))}
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-40 group">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-[#111111] focus:outline-none focus:border-primary transition-colors cursor-pointer shadow-sm"
              >
                <option value="newest">Newest</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-gray-800" />
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-shrink-0 flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-2xl font-bold text-sm transition-colors shadow-md"
            >
              <Edit3 size={16} />
              <span className="hidden sm:inline">Write Review</span>
            </button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex flex-col gap-4">
          {filteredAndSortedReviews.length > 0 ? (
            filteredAndSortedReviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-100 p-6 rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-lg">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-[#111111]">{review.name}</div>
                      <div className="text-xs text-gray-500 font-medium">{review.date}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-full">
                    {renderStars(review.rating)}
                  </div>
                </div>

                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  "{review.text}"
                </p>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  {review.verified && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                      <CheckCircle size={12} />
                      Verified Purchase
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 ml-auto">
                    <span className="text-xs text-gray-400 font-bold">Helpful?</span>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors">
                      <ThumbsUp size={14} /> {review.helpful}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors">
                      <ThumbsDown size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 border-dashed">
              <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
              <div className="text-gray-800 font-bold">No reviews found</div>
              <p className="text-gray-500 text-sm mt-1">Try changing your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#111111]/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="relative bg-white border border-gray-100 rounded-[2rem] w-full max-w-lg p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors bg-gray-100 rounded-full p-1"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-extrabold text-[#111111] mb-1">Write a Review</h2>
            <p className="text-gray-500 text-sm mb-6 font-medium">Share your experience with other customers.</p>

            <form onSubmit={handleSubmitReview} className="flex flex-col gap-5">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Overall Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star size={32} className={star <= newReview.rating ? "fill-primary text-primary" : "text-gray-200"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                <input 
                  type="text"
                  required
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-[#111111] focus:outline-none focus:border-primary transition-colors font-medium shadow-inner"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Review</label>
                <textarea 
                  required
                  rows="4"
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  placeholder="What did you like or dislike?"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-[#111111] focus:outline-none focus:border-primary transition-colors resize-none font-medium shadow-inner"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-2xl transition-all mt-2 shadow-md hover:shadow-lg"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button (Mobile only) */}
      <div className="fixed bottom-20 right-4 sm:hidden z-40">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#111111] text-white p-4 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <Edit3 size={24} />
        </button>
      </div>

    </div>
  );
};

export default Reviews;
