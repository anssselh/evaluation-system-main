// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CertificateRegistry
 * @notice Stores internship certificates on the Ethereum blockchain (Ganache local)
 * @dev Each certificate is registered once and cannot be modified (immutability)
 */
contract CertificateRegistry {

    struct Certificate {
        string  certificateNumber;
        string  studentName;
        string  companyName;
        string  position;
        uint256 issuedAt;       // Unix timestamp
        address issuedBy;       // Company wallet address
        bool    exists;
    }

    // certificateNumber => Certificate data
    mapping(string => Certificate) private certificates;

    // Ordered list for enumeration
    string[] private certificateNumbers;

    // ── Events ─────────────────────────────────────────────────────────────────
    event CertificateIssued(
        string  indexed certificateNumber,
        string          studentName,
        string          companyName,
        string          position,
        uint256         issuedAt,
        address indexed issuedBy
    );

    // ── Write Functions ────────────────────────────────────────────────────────

    /**
     * @notice Register a new internship certificate on-chain.
     * @dev Reverts if the certificateNumber was already registered.
     * @param certificateNumber Unique certificate ID (e.g. "CERT-1234567890-AB12CD34")
     * @param studentName       Full name of the intern
     * @param companyName       Name of the issuing company
     * @param position          Job title / internship position
     */
    function issueCertificate(
        string calldata certificateNumber,
        string calldata studentName,
        string calldata companyName,
        string calldata position
    ) external {
        require(
            !certificates[certificateNumber].exists,
            "CertificateRegistry: certificate already registered"
        );
        require(bytes(certificateNumber).length > 0, "CertificateRegistry: empty certificate number");
        require(bytes(studentName).length > 0, "CertificateRegistry: empty student name");
        require(bytes(companyName).length > 0, "CertificateRegistry: empty company name");

        certificates[certificateNumber] = Certificate({
            certificateNumber: certificateNumber,
            studentName:       studentName,
            companyName:       companyName,
            position:          position,
            issuedAt:          block.timestamp,
            issuedBy:          msg.sender,
            exists:            true
        });

        certificateNumbers.push(certificateNumber);

        emit CertificateIssued(
            certificateNumber,
            studentName,
            companyName,
            position,
            block.timestamp,
            msg.sender
        );
    }

    // ── Read Functions ─────────────────────────────────────────────────────────

    /**
     * @notice Retrieve certificate data by certificate number.
     * @param certificateNumber The unique certificate ID to look up.
     * @return studentName  Full name of the intern
     * @return companyName  Name of the issuing company
     * @return position     Internship position
     * @return issuedAt     Issue timestamp (Unix seconds)
     * @return issuedBy     Ethereum address that issued the certificate
     * @return exists       True if the certificate is registered on-chain
     */
    function verifyCertificate(string calldata certificateNumber)
        external
        view
        returns (
            string  memory studentName,
            string  memory companyName,
            string  memory position,
            uint256        issuedAt,
            address        issuedBy,
            bool           exists
        )
    {
        Certificate storage cert = certificates[certificateNumber];
        return (
            cert.studentName,
            cert.companyName,
            cert.position,
            cert.issuedAt,
            cert.issuedBy,
            cert.exists
        );
    }

    /**
     * @notice Returns total number of certificates registered on this contract.
     */
    function totalCertificates() external view returns (uint256) {
        return certificateNumbers.length;
    }

    /**
     * @notice Returns certificate number at a given index (for enumeration).
     */
    function certificateAt(uint256 index) external view returns (string memory) {
        require(index < certificateNumbers.length, "CertificateRegistry: index out of bounds");
        return certificateNumbers[index];
    }
}
