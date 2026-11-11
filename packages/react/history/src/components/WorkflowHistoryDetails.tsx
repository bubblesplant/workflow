import type {
  WorkflowHistoryAttachmentEvent,
  WorkflowHistoryRecord,
  WorkflowHistoryRenderers,
} from "../types";
import { formatFieldValue, getAttachmentUrl, getRecordStatus } from "../utils";

interface Props extends WorkflowHistoryRenderers {
  record: WorkflowHistoryRecord;
  onAttachmentClick?: (event: WorkflowHistoryAttachmentEvent) => void;
}

export function WorkflowHistoryDetails({
  record,
  renderOperator,
  renderOpinion,
  renderAttachment,
  onAttachmentClick,
}: Props) {
  return (
    <dl className="workflow-react-history__fields">
      {record.operator && (
        <div className="workflow-react-history__field">
          <dt>操作人</dt>
          <dd>
            {renderOperator ? (
              renderOperator({ record, operator: record.operator })
            ) : (
              <>
                {record.operator.name}
                {record.operator.description && (
                  <span className="workflow-react-history__description">
                    {record.operator.description}
                  </span>
                )}
              </>
            )}
          </dd>
        </div>
      )}
      {record.fields?.map((field, index) => (
        <div className="workflow-react-history__field" key={index}>
          <dt>{field.label}</dt>
          <dd>{formatFieldValue(field.value)}</dd>
        </div>
      ))}
      <div className="workflow-react-history__field">
        <dt>{record.opinionLabel || "处理意见"}</dt>
        <dd className={!record.opinion ? "workflow-react-history__muted" : undefined}>
          {renderOpinion
            ? renderOpinion({ record })
            : record.opinion ||
              (["pending", "processing"].includes(getRecordStatus(record.status).type)
                ? "等待处理，暂无审批意见"
                : "未填写审批意见")}
        </dd>
      </div>
      {!!record.attachments?.length && (
        <div className="workflow-react-history__field">
          <dt>{record.attachmentsLabel || "附件"}</dt>
          <dd>
            <ul className="workflow-react-history__attachments">
              {record.attachments.map((attachment) => {
                const href = getAttachmentUrl(attachment.url);
                const content = (
                  <>
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M9 2H4v12h9V6L9 2Zm0 0v4h4M6 9h5M6 11h3"
                        stroke="currentColor"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{attachment.name}</span>
                    {attachment.size && (
                      <span className="workflow-react-history__file-size">{attachment.size}</span>
                    )}
                  </>
                );
                return (
                  <li key={attachment.id}>
                    {renderAttachment ? (
                      renderAttachment({ record, attachment })
                    ) : href ? (
                      <a
                        className="workflow-react-history__attachment"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => onAttachmentClick?.({ record, attachment, event })}
                      >
                        {content}
                      </a>
                    ) : (
                      <button
                        className="workflow-react-history__attachment"
                        type="button"
                        onClick={(event) => onAttachmentClick?.({ record, attachment, event })}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </dd>
        </div>
      )}
    </dl>
  );
}
