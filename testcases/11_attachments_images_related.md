# Feature: Images, Attachments, and Related Parts

**Docs:** [Part Images](https://docs.inventree.org/en/stable/part/#part-images) · [Attachments](https://docs.inventree.org/en/stable/concepts/attachments/) · [Related Parts](https://docs.inventree.org/en/stable/part/views/#related-parts) · [Show related parts](https://docs.inventree.org/en/stable/settings/global/#parts)

Image actions appear when hovering the part image on the part view. Attachments are files or external links. Related parts can be disabled globally.

| ID | Area | Scenario | Preconditions | Test Data | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|---|---|
| UI-PART-241 | Images | Upload a new part image | Part detail open. IMG-PNG valid. | IMG-PNG. | 1. Hover part image. 2. **Upload new image**. 3. Select IMG-PNG. | Image is associated with the part and shown on the detail page. | Positive | P1 |
| UI-PART-242 | Images | Thumbnail is generated for category/table views | Part has a newly uploaded image. | IMG-PNG. | 1. Upload image. 2. Open the part’s category list. | Thumbnail appears in the table. Thumbnail is a reduced-size image. | Positive | P2 |
| UI-PART-243 | Images | Select from existing images | At least one other part already has an image. | Existing image in the library. | 1. Hover image. 2. **Select from existing images**. 3. Choose an existing image. | Selected image is associated with this part. | Positive | P2 |
| UI-PART-244 | Images | Delete part image | Part currently has an image. | Any image. | 1. Hover image. 2. **Delete image**. 3. Confirm if prompted. | Image is removed from the part. Detail page no longer shows that image. | Positive | P2 |
| UI-PART-245 | Images | Corrupt image file does not get a thumbnail as a valid image | Attachment or image upload of IMG-BAD. | File named `.png` with invalid payload. | 1. Upload IMG-BAD as part image or attachment. | If used as attachment: no thumbnail; `is_image` remains false. If used as part image: **Needs clarification** whether the part image upload is rejected. | Negative | P3 |
| UI-PART-246 | Attachments | Upload a file attachment | Part Attachments tab. ATT-PDF. | ATT-PDF. | 1. Open Attachments. 2. **Add attachment**. 3. Upload ATT-PDF. | File is listed and can be downloaded. | Positive | P1 |
| UI-PART-247 | Attachments | Add an external link attachment | Attachments tab. | URL=`https://example.com/datasheet`. | 1. **Add external link**. 2. Save URL. | Link attachment is listed. Opening it targets the external URL. No thumbnail is assigned. | Positive | P2 |
| UI-PART-248 | Attachments | Rename a file attachment without re-upload | Existing file attachment. | New filename=`QA-datasheet-v2.pdf`. | 1. Edit the attachment. 2. Change filename. 3. Save. | Filename updates. File does not need to be re-uploaded. Download still works. | Persistence | P2 |
| UI-PART-249 | Related Parts | Add a related part | **Show related parts** True. Two parts. | Relate PART-STD to PART-ASM. | 1. Open PART-STD Related Parts. 2. Add PART-ASM. | PART-ASM appears in the Related Parts table. | Positive | P1 |
| UI-PART-250 | Related Parts | Related part link persists after reload | Relationship created. | Same pair. | 1. Reload PART-STD. 2. Open Related Parts. | PART-ASM is still listed. | Persistence | P1 |
| UI-PART-251 | Related Parts | Remove a related part | Existing relationship. | Same pair. | 1. Remove PART-ASM from related parts. 2. Reload. | Relationship is gone. Both parts still exist. | Positive | P2 |
| UI-PART-252 | Related Parts | Cannot relate a part to itself | Related Parts form. | PART-STD related to PART-STD. | 1. Attempt to add the same part as related. | **Needs clarification:** self-relation is not documented. Expect rejection. | Negative | P3 |
| UI-PART-253 | Related Parts | Feature hidden when Show related parts is False | **Show related parts** False. Restore after test. | Any part. | 1. Disable setting. 2. Open a part. | Related parts are not displayed. | State-transition | P2 |
| UI-PART-254 | Attachments | Image attachment gets a thumbnail | Upload PNG/JPEG/GIF/BMP/WEBP attachment. | Valid PNG attachment. | 1. Upload image file as attachment (not necessarily part image). | Thumbnail is generated in the background. Attachment is flagged as an image. | Positive | P3 |
| UI-PART-255 | Attachments | Multiple attachments on one part | Two files plus one link. | ATT-PDF, IMG-PNG, a URL. | 1. Add all three. 2. Reload Attachments. | All three remain listed independently. | Boundary | P2 |
