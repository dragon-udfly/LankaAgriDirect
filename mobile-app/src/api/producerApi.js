import axiosInstance from './axiosInstance';

export const getVerifiedProducers = params =>
  axiosInstance.get('/producers', {params});

export const getProducerDetails = id => axiosInstance.get(`/producers/${id}`);

export const getProducerProducts = (id, includeSoldOut = false) =>
  axiosInstance.get(`/producers/${id}/products`, {
    params: {includeSoldOut},
  });

export const getProducerLocationsForMap = params =>
  axiosInstance.get('/map/producers', {params});
