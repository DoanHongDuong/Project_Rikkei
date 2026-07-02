# Database Overview

## Main Entities

### Department

* id
* name
* description

### User

* full_name
* email
* role
* status
* department_id

Roles:

* ADMIN
* PM
* MEMBER

### Project

* name
* description
* status
* manager_id

### Project Member

Relationship between User and Project.

### Roadmap

Contains project milestones.

### Roadmap Item

Contains roadmap stages.

### Task

Core working unit.

Fields:

* title
* description
* status
* priority
* assignee
* deadline

Task Status:

* TODO
* IN_PROGRESS
* REVIEW
* BLOCKED
* DONE
* CANCELED

Task Priority:

* LOW
* MEDIUM
* HIGH
* URGENT

### Task Comment

Discussion inside task.

### Task Attachment

File upload for task.

### Extension Request

Request deadline extension workflow.

Status:

* PENDING
* APPROVED
* REJECTED

### Notification

Realtime system notification.

### Task History

Audit log for task changes.
