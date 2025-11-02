import { PartialType } from '@nestjs/swagger';
import { CreateMoneyInoutDto } from './create-money-inout.dto';

export class UpdateMoneyInoutDto extends PartialType(CreateMoneyInoutDto) {}
