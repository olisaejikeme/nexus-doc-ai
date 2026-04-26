from enum import Enum


class DocumentStatus(str, Enum):
    UPLOADED = 'UPLOADED'
    FAILED = 'FAILED'