import { ChannelType } from '../templates/domain/enums/channel-type.enum';

export const getChannelDefaultValue = (type: ChannelType) => {
  switch (type) {
    case ChannelType.BOOLEAN:
      return false;
    case ChannelType.NUMBER:
      return 0;
    case ChannelType.STRING:
      return '';
    case ChannelType.OBJECT:
      return {};
    default:
      return '';
  }
};
