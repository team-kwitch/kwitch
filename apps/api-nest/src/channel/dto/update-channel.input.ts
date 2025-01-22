import { CreateChannelInput } from './create-channel.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateChannelInput extends PartialType(CreateChannelInput) {
  id: number;
}
