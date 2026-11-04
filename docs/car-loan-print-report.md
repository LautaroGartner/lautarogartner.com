# Car loan print report

Print uses a dedicated report, separate from the interactive/paginated calculator. It includes the selected valid inputs, purchase/financing totals, assumptions and the complete repayment schedule. The report has no horizontal scroll container or pagination controls. Native printing/Save as PDF uses the print stylesheet.

A cash purchase has a no-loan state. If the form is invalid, the report explicitly identifies the last valid estimate and lists those valid inputs. Unit tests cover 60-, 84- and 120-payment schedules, cash purchases and invalid-entry labeling; all 38 calculator tests pass.

The actual exported HTML and compiled print CSS were rendered with WeasyPrint for A4 and US Letter. The 60-payment sample produced three pages in each size and includes the final $608.41 payment and $0 balance. A live-form 120-payment report rendered five Letter pages; the cash report rendered one. PDF text checks and page-image inspection verified content and layout. This is a print-renderer check, not a claim that every browser/printer setting has identical pagination.

The tax-and-fee table explanation is now outside its horizontal scrolling region, so it wraps to the screen width while the data table can still scroll. The table retains a short semantic caption and is associated with the visible explanation for assistive technology.
