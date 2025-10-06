import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Snowflake, Coins, RefreshCw } from "lucide-react";

const authorities = [
{
  id: 'revoke_freeze',
  icon: Snowflake,
  title: 'Revoke Freeze',
  description: 'No one will be able to freeze token accounts',
  cost: '+0.05 SOL'
},
{
  id: 'revoke_mint',
  icon: Coins,
  title: 'Revoke Mint',
  description: 'No one will be able to create more tokens',
  cost: '+0.05 SOL'
},
{
  id: 'revoke_update',
  icon: RefreshCw,
  title: 'Revoke Update',
  description: 'No one will be able to modify metadata',
  cost: '+0.05 SOL'
}];


export default function RevokeAuthorities({ selected, onChange }) {
  return (
    <div className="space-y-4">
            <h3 className="text-[#faff5c] text-sm font-semibold">Revoke Authorities</h3>
            <p className="text-[#f4ff57] text-xs -mt-2">
                Solana Token has 3 authorities: Freeze, Mint, and Update. Revoke them to secure your token.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {authorities.map((auth) => {
          const Icon = auth.icon;
          const isSelected = selected[auth.id];
          return (
            <label
              key={auth.id}
              className={`relative flex items-start p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
              isSelected ?
              'border-teal-400 bg-teal-50/50' :
              'border-gray-100 hover:border-teal-200 hover:bg-teal-50/30'}`
              }>

                            <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onChange(auth.id, checked)} className="bg-[#f7f7f7] mt-1 peer h-4 w-4 shrink-0 rounded-sm border border-primary" />

                            <div className="ml-3 flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-teal-600' : 'text-gray-400'}`} />
                                    <span className="text-[#e8fc4f] text-xs sm:text-sm font-semibold truncate">
                                        {auth.title}
                                    </span>
                                </div>
                                <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed mb-1">
                                    {auth.description}
                                </p>
                                <span className={`text-xs font-medium ${isSelected ? 'text-teal-600' : 'text-gray-400'}`}>
                                    {auth.cost}
                                </span>
                            </div>
                        </label>);

        })}
            </div>
        </div>);

}