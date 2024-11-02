const res = require('express/lib/response');
const mongoose = require('mongoose');
const Loc = mongoose.model('Locations');


const locationsListByDistance = async (req, res) => {
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const near = {
      type: "Point",
      coordinates: [lng, lat]
    };
    const geoOptions = {
      distanceField: "distance.calculated",
      key: 'coords',
      spherical: true,
      maxDistance: 20000,
    };
    if (!lng || !lat) {
      return res
        .status(404)
        .json({ "message": "lng and lat query parameters are required" });
    }
  
    try {
      const results = await Loc.aggregate([
        {
          $geoNear: {
            near,
            ...geoOptions
          }
        }
      ]);
      const locations = results.map(result => {
        return {
          _id: result._id,
          name: result.name,
          address: result.address,
          rating: result.rating,
          facilities: result.facilities,
          distance: `${result.distance.calculated.toFixed()}`
        }
      });
      res
        .status(200)
        .json(locations);
    } catch (err) {
      res
        .status(404)
        .json(err);
    }
  };
  
  const locationsReadOne = async (req, res) => {
    try {
      const location = await Loc.findById(req.params.locationid).exec();
      if (!location) {
        return res
          .status(404)
          .json({ "message": "location not found" });
      }
      return res
        .status(200)
        .json(location);
    } catch (err) {
      return res
        .status(400)
        .json(err);
    }
  };
  
const locationsCreate = async (req, res) => {
    try {
      const location = await Loc.create({
        name: req.body.name,
        address: req.body.address,
        facilities: req.body.facilities.split(","),
        coords: {
          type: "Point",
          coordinates: [
            parseFloat(req.body.lng),
            parseFloat(req.body.lat)
          ]
        },
        openingTimes: [
          {
            days: req.body.days1,
            opening: req.body.opening1,
            closing: req.body.closing1,
            closed: req.body.closed1
          },
          {
            days: req.body.days2,
            opening: req.body.opening2,
            closing: req.body.closing2,
            closed: req.body.closed2
          }
        ]
      });
  
      // 성공 시, 생성된 location 데이터를 응답으로 반환
      res.status(201).json(location);
  
    } catch (err) {
      // 에러 발생 시, 400 상태 코드와 에러 메시지 반환
      res.status(400).json(err);
    }
};
  
const locationsUpdateOne = async (req, res) => {
    // locationId가 없는 경우
    if (!req.params.locationid) {
      return res.status(404).json({
        message: "Not found, locationid is required"
      });
    }
  
    try {
      // 해당 locationId로 장소 찾기
      const location = await Loc.findById(req.params.locationid).select('-reviews -rating').exec();
  
      // 장소가 없는 경우
      if (!location) {
        return res.status(404).json({
          message: "locationid not found"
        });
      }
  
      // 장소 필드 업데이트
      location.name = req.body.name;
      location.address = req.body.address;
      location.facilities = req.body.facilities.split(',');
      location.coords = [
        parseFloat(req.body.lng),
        parseFloat(req.body.lat)
      ];
  
      // openingTimes 배열 업데이트
      location.openingTimes = [
        {
          days: req.body.days1,
          opening: req.body.opening1,
          closing: req.body.closing1,
          closed: req.body.closed1
        },
        {
          days: req.body.days2,
          opening: req.body.opening2,
          closing: req.body.closing2,
          closed: req.body.closed2
        }
      ];
  
      // 변경된 장소 저장
      const updatedLocation = await location.save();
  
      // 업데이트된 장소 반환
      res.status(200).json(updatedLocation);
      
    } catch (err) {
      // 에러 처리
      res.status(400).json(err);
    }
};

const locationsDeleteOne = async (req, res) => {
    const { locationid } = req.params;
  
    // locationid가 없는 경우
    if (!locationid) {
      return res.status(404).json({
        message: "No Location"
      });
    }
  
    try {
      // locationid로 장소 삭제
      const location = await Loc.findByIdAndRemove(locationid).exec();
  
      // 삭제된 장소가 없는 경우
      if (!location) {
        return res.status(404).json({
          message: "Location not found"
        });
      }
  
      // 성공적으로 삭제된 경우
      return res.status(204).json(null); // 204: 성공, 내용 없음
    } catch (err) {
      // 에러 발생 시 처리
      return res.status(400).json(err);
    }
};
  
  module.exports = {
    locationsListByDistance,
    locationsCreate,
    locationsReadOne,
    locationsUpdateOne,
    locationsDeleteOne
  };