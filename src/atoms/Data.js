import { atom } from 'recoil';

const dataState = atom({
  key: 'dataState',
  default: [],
});

export default dataState;
