import React, { useEffect, useState } from "react";


const AccountList = ({ accounts }) => {
    return (
        <div>

              {accounts.map((account) => (
                <div
                key={account.id}
                className="p-4 rounded-lg border-2 border-[#9B8BB8] flex justify-between items-center my-4"
            >
                {/* account name */}
                <h4 className="text-base font-semibold text-[#201833]">
                    {account.account_name}
                </h4>

                {/* balance */}
                <p className="text-sm text-[#201833] font-medium">
                    Rs. {Number(account.balance).toFixed(2)}
                </p>
            </div>
            ))}
        </div>
    );
};

const styles = {
    emptyState: {
        padding: '40px 0',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
    }
}
export default AccountList;