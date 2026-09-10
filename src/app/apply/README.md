# Application frontend

`/apply/[portfolio]` builds one page for each existing portfolio ID. `/apply`
redirects to `/portfolios`. Forms are local previews: answers and files live in
React memory and are not persisted, uploaded, or submitted.

The application page renders dark by default; appearance values live at the top
of `apply.module.css`. The notification bar is removed and the fixed header
sits at the very top while an application page is mounted; both restore on
navigation. The vertical progress dock on the right edge tracks completed
questions while scrolling. The “submit application” button currently performs
local validation only.

## Replacing dummy questions

Edit `applicationData.js`. Each application contains sections with `id`, `title`,
and `questions`. Keep question IDs unique across the application and stable when
changing wording: they are also the answer keys. Change the question data rather
than duplicating the form or writing portfolio-specific input components.

All questions support `id`, `type`, `label`, `description`, and `required`.

| Type | Additional configuration | Answer value |
| --- | --- | --- |
| `short` | `placeholder`, `maxLength`, `autoComplete` | string |
| `paragraph` | `placeholder`, `maxLength` | string |
| `radio` | `options` | string |
| `checkboxes` | `options` | string array |
| `dropdown` | `options`, `placeholder` | string |
| `scale` | `min`, `max`, `lowLabel`, `highLabel` | numeric string |
| `rating` | `max` (star count) | numeric string |
| `file` | `accept` (comma-separated extensions), `maxBytes` | File or null |
| `radioGrid` | `rows`, `columns` | object mapping row to string |
| `checkboxGrid` | `rows`, `columns` | object mapping row to string array |
| `date` | — | YYYY-MM-DD string |
| `time` | — | HH:mm string |

Required grids require an answer in each row. The sample upload accepts one
PDF/PNG/JPG up to 2 MB. Adjust the upload validation messages in `formModel.js`
if changing these restrictions. Rating and linear scale use native radio inputs;
grid rows use fieldsets and adapt to stacked options on smaller screens.

`QuestionField.jsx` maps question types to reusable controls. `formModel.js`
contains completeness, validation, and payload creation. `ApplyForm.jsx` owns
answers, progress, and local preview feedback. GSAP animations use scoped
`useGSAP` hooks with cleanup and respect reduced motion.

## Future submission integration

Replace the local success branch in `checkApplication` with the submission
adapter. `buildApplicationPayload(application, answers)` returns portfolio,
hiring cycle, and keyed answers. Use multipart FormData to send File objects;
serialize grids/checkbox lists deliberately for spreadsheet mapping. Add pending
and server-error states, preserve answers on failure, and only show submission
success after the receiving service confirms acceptance. Update the preview copy
and button label when real submissions are enabled.
