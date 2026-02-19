import { IsString, IsNotEmpty, IsArray, IsOptional, IsMongoId } from 'class-validator';

export class CreateDocDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Valida se cada item dentro do array é uma string
  tags?: string[];

  @IsMongoId({ message: 'O ID do autor deve ser um ObjectId válido do MongoDB' })
  @IsNotEmpty()
  authorId: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsOptional()
  @IsString()
  badgeIcon?: string;

  @IsOptional()
  @IsString()
  badgeName?: string;
}