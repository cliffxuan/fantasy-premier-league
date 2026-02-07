String getPositionName(int elementType) {
  switch (elementType) {
    case 1:
      return 'GKP';
    case 2:
      return 'DEF';
    case 3:
      return 'MID';
    case 4:
      return 'FWD';
    default:
      return '';
  }
}

String getPositionFullName(int elementType) {
  switch (elementType) {
    case 1:
      return 'Goalkeeper';
    case 2:
      return 'Defender';
    case 3:
      return 'Midfielder';
    case 4:
      return 'Forward';
    default:
      return '';
  }
}
