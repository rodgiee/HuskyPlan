# SectionSchema


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [default to undefined]
**section_catalog** | **string** |  | [default to undefined]
**instruction_type** | **string** |  | [default to undefined]
**enrollment_cap** | **number** |  | [default to undefined]
**enrollment_total** | **number** |  | [default to undefined]
**waitlist_cap** | **number** |  | [default to undefined]
**waitlist_total** | **number** |  | [default to undefined]
**professors** | [**Array&lt;SectionProfessorSchema&gt;**](SectionProfessorSchema.md) |  | [optional] [default to undefined]
**meetings** | [**Array&lt;MeetingSchema&gt;**](MeetingSchema.md) |  | [optional] [default to undefined]

## Example

```typescript
import { SectionSchema } from './api';

const instance: SectionSchema = {
    id,
    section_catalog,
    instruction_type,
    enrollment_cap,
    enrollment_total,
    waitlist_cap,
    waitlist_total,
    professors,
    meetings,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
