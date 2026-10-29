import { Request } from 'express';
import { In_PaginationDto } from '../../interfaces/responseApi.interface';
import dayjs from 'dayjs';
import { In_SplitDate } from '../../interfaces/app.interface';
import { config } from '../../config';

export const devModeSlug = (str: string) => {
  const mode: string = config.app.env?.toLowerCase();
  if (mode == 'development' || mode == 'dev') {
    return `${str}_dev`;
  }
  return str;
};

export const paginationClear = (req: Request) => {
  const page: number = Number(req?.query?.['page'] ?? 1);
  const limit: number = Number(req.query?.['limit'] ?? 10);
  return {
    page,
    limit,
    sortBy:
      typeof req?.query['sort_by'] === 'string' ? req.query['sort_by'] : '',
    orderBy:
      String(req.query['order_by']).toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    search:
      typeof req.query?.['search'] === 'string' ? req.query['search'] : '',
  } as In_PaginationDto;
};

export const splitDate = (dateStr: string): In_SplitDate => {
  const date = dayjs(dateStr);
  const day = date.format('DD');
  const month = date.format('MM');
  const year = date.format('YYYY');

  return {
    day,
    month,
    year,
  };
};

export const getFormatDate = (
  dateStr: string = '',
  formatted: string = 'YYYY-MM-DD'
): string => {
  if (dateStr == '') {
    return dayjs().format(formatted);
  }
  return dayjs(dateStr).format(formatted);
};


export const combineArray = (arr: any[]): string => arr.join(', ');
