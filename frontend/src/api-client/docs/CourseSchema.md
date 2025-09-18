# CourseSchema


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**subject_code** | **string** |  | [default to undefined]
**subject_desc** | **string** |  | [default to undefined]
**catalog_number** | **string** |  | [default to undefined]
**description** | **string** |  | [default to undefined]
**min_credits** | **number** |  | [default to undefined]
**max_credits** | **number** |  | [default to undefined]
**sections** | [**Array&lt;SectionSchema&gt;**](SectionSchema.md) |  | [optional] [default to undefined]

## Example

```typescript
import { CourseSchema } from './api';

const instance: CourseSchema = {
    subject_code,
    subject_desc,
    catalog_number,
    description,
    min_credits,
    max_credits,
    sections,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
