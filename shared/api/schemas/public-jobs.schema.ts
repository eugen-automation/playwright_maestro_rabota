import { z } from 'zod';
import { PUBLIC_VIP_VACANCY_PATH } from '../clients/public-jobs-endpoints.js';

export const JobSuggestionsResponseSchema = z.strictObject({
  suggestions: z.array(
    z.strictObject({
      value: z.string().min(1),
      data: z.number().int().positive(),
    }),
  ),
});

// This schema covers the observed VIP popup. Check standard/free listings
// and custom links before adding support for those responses.
export const VipVacancyResponseSchema = z.strictObject({
  vacancy_model: z.null(),
  data: z.strictObject({
    c_list: z.boolean(),
    custom_link: z.null(),
    company_ad: z.strictObject({
      company_ad_id: z.number().int().positive(),
      showResumeBlock: z.number().int(),
      showResponseBlock: z.number().int(),
    }),
  }),
  vacancy_content: z.string().min(1),
});

export const PublicVipVacancyReferenceSchema = z
  .strictObject({
    relativePath: z.string().regex(PUBLIC_VIP_VACANCY_PATH),
    id: z.number().int().positive(),
  })
  .refine(
    ({ relativePath, id }) =>
      Number(PUBLIC_VIP_VACANCY_PATH.exec(relativePath)?.groups?.id) === id,
    'Vacancy ID must agree with its observed relative path.',
  );

export type PublicVipVacancyReference = z.infer<
  typeof PublicVipVacancyReferenceSchema
>;
