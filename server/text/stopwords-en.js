// Stopwords em inglês — gramaticais + domínio de vagas de emprego.
const STOPWORDS_EN = new Set([
  'a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'without',
  'from', 'by', 'about', 'into', 'over', 'after', 'before', 'between',
  'and', 'or', 'but', 'nor', 'so', 'yet', 'if', 'then', 'than', 'because',
  'as', 'that', 'this', 'these', 'those', 'which', 'who', 'whom', 'whose',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their',
  'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
  'can', 'could', 'may', 'might', 'must',
  'not', 'no', 'yes', 'very', 'just', 'also', 'only', 'more', 'most', 'less',
  'some', 'any', 'all', 'each', 'every', 'other', 'another', 'such', 'own',
  'here', 'there', 'where', 'when', 'why', 'how', 'what',
  'up', 'down', 'out', 'off', 'again', 'further', 'once',
  // domínio de vagas
  'job', 'jobs', 'company', 'candidate', 'candidates', 'requirement', 'requirements',
  'benefit', 'benefits', 'team', 'opportunity', 'opportunities', 'role', 'roles',
  'experience', 'experiences', 'knowledge', 'skill', 'skills', 'position',
  'apply', 'applicant', 'applicants', 'resume', 'cv', 'hiring', 'hire',
  'looking', 'seeking', 'required', 'preferred', 'nice', 'plus'
]);

module.exports = { STOPWORDS_EN };
