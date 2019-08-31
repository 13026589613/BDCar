import axios from "./axios.js";

// 获取车列表
export const getCarList = function(params) {
  return axios.post("/getbindCar", params);
};

// 添加车辆信息
export const bindCars = function(params) {
  return axios.post("/bindCar", params);
};

// 钱包概览
export const wallet = function(params) {
  return axios.post("/wallet", params);
};

// 行程概览
export const record = function(params) {
  return axios.post("/route", params);
};

// 提现到零钱
export const withdraw = function(params) {
  return axios.post("/withdraw", params);
};
