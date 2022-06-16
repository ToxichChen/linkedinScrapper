<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use App\Models\CreatedQuery;

class CreatedQueryController extends Controller
{
    public function index()
    {
        $createdQuery = CreatedQuery::leftJoin('companies', function($join) {
            $join->on('created_queries.company_id', '=', 'companies.id');
        })->get(['created_queries.*', 'companies.company_name']);

        return View::make('created_queries.index')->with('createdQueries', $createdQuery);
    }

    public function createForm()
    {
        $companies = Company::all();
        return View::make('created_queries.create')->with('companies', $companies);
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'company' => 'required|numeric|exists:companies,id',
            'type' => 'required|in:init,update,past'
        ]);

        $createdQuery = new CreatedQuery();
        $createdQuery->company_id = $validated['company'];
        $createdQuery->type_of_parsing = $validated['type'];
        $createdQuery->save();

        return redirect('/created_queries');
    }

    public function edit($id)
    {
        $createdQuery = CreatedQuery::find($id);
        $companies = Company::all();
        return View::make('created_queries.edit')
            ->with(['createdQuery' => $createdQuery, 'companies' => $companies]);
    }

    public function update(Request $request, $id)
    {

        $validated = $request->validate([
            'company' => 'required|numeric|exists:companies,id',
            'type' => 'required|in:init,update,past',
        ]);

        $createdQuery = CreatedQuery::find($id);
        $createdQuery->company_id = $validated['company'];
        $createdQuery->type_of_parsing = $validated['type'];
        if ($request->is_parsed) {
            $createdQuery->is_parsed = $validated['is_parsed'] == 'on' ? 1 : 0;
        } else {
            $createdQuery->is_parsed = 0;
        }
        $createdQuery->save();
        return redirect('/created_queries');
    }

    public function delete($id)
    {
        $createdQuery = CreatedQuery::where('id',$id)->delete();

        return redirect('/created_queries');
    }
}
