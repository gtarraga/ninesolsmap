import { useMapEvent } from 'react-leaflet';

const useMapClickHandler = (handleClick: () => void) => {
  useMapEvent('click', handleClick);
};

export default useMapClickHandler;
