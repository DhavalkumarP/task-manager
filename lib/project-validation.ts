import * as Yup from 'yup';

export const createProjectValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name must be less than 100 characters')
    .required('Project name is required'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters')
    .required('Description is required'),
});

export const updateProjectValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name must be less than 100 characters')
    .optional(),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});