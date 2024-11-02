const mongoose = require('mongoose');
const Loc = mongoose.model('Locations');

const reviewsCreate = async (req, res) => {
    const locationId = req.params.locationid;
    if (locationId) {
      try {
        const location = await Loc.findById(locationId).select('reviews').exec();
        if (!location) {
          res
            .status(404)
            .json({ "message": "Location not found" });
        } else {
          doAddReview(req, res, location);
        }
      } catch (err) {
        res
          .status(400)
          .json(err);
      }
    } else {
      res
        .status(404)
        .json({ "message": "Location not found" });
    }
};




const doAddReview = async (req, res, location) => {
  if (!location) {
    res
      .status(404)
      .json({ "message": "Location not found" });
  } else {
    const { author, rating, reviewText } = req.body;
    location.reviews.push({
      author,
      rating,
      reviewText
    });

    try {
      const updatedLocation = await location.save(); // Promise 사용
      updateAverageRating(updatedLocation._id); // 평균 평점 업데이트
      const thisReview = updatedLocation.reviews.slice(-1).pop(); // 마지막으로 추가된 리뷰 반환
      res
        .status(201)
        .json(thisReview);
    } catch (err) {
      res
        .status(400)
        .json(err);
    }
  }
};




const doSetAverageRating = async (location) => {
  if (location.reviews && location.reviews.length > 0) {
      const count = location.reviews.length;
      const total = location.reviews.reduce((acc, { rating }) => {
          return acc + rating;
      }, 0);

      location.rating = parseInt(total / count, 10);

      try {
          await location.save();
          console.log(`Average rating updated to ${location.rating}`);
      } catch (err) {
          console.error("Error updating rating:", err);
      }
  }
};
  
const updateAverageRating = async (locationId) => {
  try {
      const location = await Loc.findById(locationId).select('rating reviews').exec();
      if (location) {
          doSetAverageRating(location);
      }
  } catch (err) {
      console.error("Error fetching location:", err);
  }
};


const reviewsReadOne = async (req, res) => {
  try {
    const location = await Loc.findById(req.params.locationid).select('name reviews').exec();
    if (!location) {
      return res
        .status(404)
        .json({ "message": "location not found" });
    }
    if (location.reviews && location.reviews.length > 0) {
      const review = location.reviews.id(req.params.reviewid);
      if (!review) {
        return res
          .status(404)
          .json({ "message": "review not found" });
      }
      const response = {
        location: {
          name: location.name,
          id: req.params.locationid
        },
        review
      };
      return res
        .status(200)
        .json(response);
    } else {
      return res
        .status(404)
        .json({ "message": "No reviews found" });
    }
  } catch (err) {
    return res
      .status(400)
      .json(err);
  }
};

const reviewsUpdateOne = async (req, res) => {
    // locationId와 reviewId가 모두 필요한 경우
    if (!req.params.locationid || !req.params.reviewid) {
      return res.status(404).json({
        message: "Not found, locationid and reviewid are both required"
      });
    }
  
    try {
      // location 찾기
      const location = await Loc.findById(req.params.locationid).select('reviews').exec();
  
      // location이 없을 경우
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
  
      // 리뷰가 존재하고 리뷰 목록이 있을 경우
      if (location.reviews && location.reviews.length > 0) {
        const thisReview = location.reviews.id(req.params.reviewid);
  
        // 리뷰가 없을 경우
        if (!thisReview) {
          return res.status(404).json({ message: "Review not found" });
        }
  
        // 리뷰 업데이트
        thisReview.author = req.body.author;
        thisReview.rating = req.body.rating;
        thisReview.reviewText = req.body.reviewText;
  
        // 업데이트된 리뷰 저장
        const updatedLocation = await location.save();
  
        // 평균 평점 업데이트
        updateAverageRating(updatedLocation._id);
  
        // 성공적으로 업데이트된 리뷰 반환
        return res.status(200).json(thisReview);
      } else {
        return res.status(404).json({ message: "No review to update" });
      }
    } catch (err) {
      // 에러 발생 시 처리
      return res.status(400).json(err);
    }
};

const reviewsDeleteOne = async (req, res) => {
    const { locationid, reviewid } = req.params;
    if (!locationid || !reviewid) {
      return res.status(404).json({ 'message': 'Not found, locationid and reviewid are both required' });
    }
  
    try {
      const location = await Loc.findById(locationid).select('reviews').exec();
      if (!location) {
        return res.status(404).json({ 'message': 'Location not found' });
      }
  
      if (location.reviews && location.reviews.length > 0) {
        const review = location.reviews.id(reviewid);
        if (!review) {
          return res.status(404).json({ 'message': 'Review not found' });
        }
  
        // review.remove();
        review.deleteOne();
        await location.save();
        await updateAverageRating(location._id);
        return res.status(204).json(null);
      } else {
        return res.status(404).json({ 'message': 'No Review to delete' });
      }
    } catch (err) {
      return res.status(400).json(err);
    }
};


module.exports = {
  reviewsCreate,
  reviewsReadOne,
  reviewsUpdateOne,
  reviewsDeleteOne
};